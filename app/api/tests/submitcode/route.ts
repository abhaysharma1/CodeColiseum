import { Exam, ExamAttempt } from "@/interfaces/DB Schema";
import { canGiveExam, validateAttempt } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface data {
  languageId: number;
  code: string;
  examDetails: Exam;
  examAttempt: ExamAttempt;
  problemId: string;
}

interface JudgeResponse {
  stdout: string | null;
  time: string;
  memory: number;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}

type SubmissionStatus =
  | "IN_QUEUE"
  | "RUNNING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "COMPILATION_ERROR"
  | "RUNTIME_ERROR"
  | "TIME_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

interface TestCaseResult {
  status: SubmissionStatus;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string;
  memory: number;
}

interface SubmitCodeSuccessResponse {
  success: true;
  submissionId: string;
  status:
    | "ACCEPTED"
    | "PARTIAL"
    | "WRONG_ANSWER"
    | "COMPILE_ERROR"
    | "RUNTIME_ERROR"
    | "TIME_LIMIT"
    | "INTERNAL_ERROR";
  score: number;
  passedCount: number;
  totalCount: number;
  results: TestCaseResult[];
}

interface SubmitCodeErrorResponse {
  error: string;
  details?: string;
}

export type SubmitCodeResponse =
  | SubmitCodeSuccessResponse
  | SubmitCodeErrorResponse;

const availableLanguages = [
  { id: 50, name: "C", monacoLang: "c" },
  { id: 54, name: "C++", monacoLang: "cpp" },
  { id: 51, name: "C#", monacoLang: "csharp" },
  { id: 60, name: "Go", monacoLang: "go" },
  { id: 62, name: "Java", monacoLang: "java" },
  { id: 63, name: "JavaScript", monacoLang: "javascript" },
  { id: 71, name: "Python", monacoLang: "python" },
  { id: 73, name: "Rust", monacoLang: "rust" },
  { id: 74, name: "TypeScript", monacoLang: "typescript" },
];

function mapJudge0Status(statusId: number): SubmissionStatus {
  if (statusId === 1) return "IN_QUEUE";
  if (statusId === 2) return "RUNNING";
  if (statusId === 3) return "ACCEPTED";
  if (statusId === 4) return "WRONG_ANSWER";
  if (statusId === 5) return "TIME_LIMIT_EXCEEDED";
  if (statusId === 6) return "COMPILATION_ERROR";
  if (statusId >= 7 && statusId <= 12) return "RUNTIME_ERROR";
  return "INTERNAL_ERROR";
}

const getHeaders = () => {
  if (process.env.JUDGE0_MODE === "rapidapi") {
    return {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
      "x-rapidapi-host":
        process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
    };
  }
  return {};
};

export async function POST(req: NextRequest) {
  const reqbody = await req.json();
  const data = reqbody as data;
  const language = availableLanguages.find(
    (item) => item.id == data.languageId
  )?.name;
  let session;

  const examDetails = await prisma.exam.findUnique({
    where: { id: data.examDetails.id },
  });
  if (!examDetails) {
    return NextResponse.json({ error: "Exam Not Found" }, { status: 404 });
  }

  try {
    session = await canGiveExam(data.examDetails);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    validateAttempt(examDetails.id, session.user.id);
  } catch (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const casesData = await prisma.testCase.findUnique({
    where: {
      problemId: data.problemId,
    },
  });

  if (!casesData) {
    return NextResponse.json(
      { error: "Test cases not found for this problem" },
      { status: 404 }
    );
  }

  let cases;

  if (typeof casesData.cases === "string") {
    cases = JSON.parse(casesData.cases);
  } else {
    cases = JSON.parse(JSON.stringify(casesData.cases));
  }

  if (!cases || !Array.isArray(cases) || cases.length === 0) {
    return NextResponse.json(
      { error: "Test cases not found for this problem" },
      { status: 404 }
    );
  }

  const submissions = cases.map((item) => ({
    language_id: data.languageId,
    source_code: data.code,
    stdin: item.input,
    expected_output: item.output,
  }));

  // 🌍 Choose the correct Judge0 domain
  const JUDGE0_DOMAIN = process.env.JUDGE0_DOMAIN;

  try {
    // 📨 Submit all test cases
    const batchResponse = await axios.post(
      `${JUDGE0_DOMAIN}/submissions/batch?base64_encoded=false`,
      { submissions },
      {
        headers: getHeaders(),
        params: {
          base64_encoded: "false",
          wait: "false",
          fields: "*",
        },
      }
    );

    const tokens = (batchResponse.data as any[]).map((item: any) => item.token);

    const pollSubmission = async (token: string): Promise<JudgeResponse> => {
      let attempts = 0;
      const maxAttempts = 30; // ~15 seconds (30 * 500ms)

      while (attempts < maxAttempts) {
        const statusResponse = await axios.get(
          `${JUDGE0_DOMAIN}/submissions/${token}`,
          {
            params: {
              base64_encoded: false,
              fields: "*",
            },
            headers: getHeaders(),
          }
        );

        const result = statusResponse.data as JudgeResponse;

        // Status IDs: 1=In Queue, 2=Processing, 3+=Finished
        if (result.status.id > 2) {
          return result;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }
      throw new Error(`Submission ${token} timed out`);
    };

    const responses = await Promise.all(
      tokens.map((token) => pollSubmission(token))
    );

    const finalResults = responses.map((res) => ({
      status: mapJudge0Status(res.status.id),
      stdout: res.stdout,
      stderr: res.stderr,
      compile_output: res.compile_output,
      time: res.time,
      memory: res.memory,
    }));

    // Calculate overall status and score
    const passedCount = finalResults.filter(
      (r) => r.status === "ACCEPTED"
    ).length;
    const totalCount = finalResults.length;
    const score = Math.round((passedCount / totalCount) * 100);

    let overallStatus:
      | "ACCEPTED"
      | "PARTIAL"
      | "WRONG_ANSWER"
      | "COMPILE_ERROR"
      | "RUNTIME_ERROR"
      | "TIME_LIMIT"
      | "INTERNAL_ERROR";

    if (finalResults.some((r) => r.status === "COMPILATION_ERROR")) {
      overallStatus = "COMPILE_ERROR";
    } else if (finalResults.some((r) => r.status === "TIME_LIMIT_EXCEEDED")) {
      overallStatus = "TIME_LIMIT";
    } else if (finalResults.some((r) => r.status === "RUNTIME_ERROR")) {
      overallStatus = "RUNTIME_ERROR";
    } else if (passedCount === totalCount) {
      overallStatus = "ACCEPTED";
    } else if (passedCount > 0) {
      overallStatus = "PARTIAL";
    } else {
      overallStatus = "WRONG_ANSWER";
    }

    // Create submission with results
    const submission = await prisma.submission.create({
      data: {
        attemptId: data.examAttempt.id,
        problemId: data.problemId,
        language: language!,
        sourceCode: data.code,
        status: overallStatus,
        score: score,
        result: finalResults,
        examId: data.examDetails.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        submissionId: submission.id,
        status: overallStatus,
        score: score,
        passedCount: passedCount,
        totalCount: totalCount,
        results: finalResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting code:", error);
    return NextResponse.json(
      {
        error: "Failed to submit code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
