import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface runTestCaseType {
  id: string;
  cases: any;
  problemId: string;
  createdAt: Date;
  updatedAt: Date;
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

interface submitResponseType {
  failedCase?: {
    language_id: number;
    source_code: string;
    stdin: string;
    expected_output: string;
  };
  noOfPassedCases: number;
  totalCases: number;
  totalMemoryUsed: number;
  totalTimeTaken: number;
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

const languages = [
  {
    id: 50,
    name: "C",
    monacoLang: "c",
  },
  {
    id: 54,
    name: "C++",
    monacoLang: "cpp",
  },
  {
    id: 51,
    name: "C#",
    monacoLang: "csharp",
  },
  {
    id: 60,
    name: "Go",
    monacoLang: "go",
  },
  {
    id: 62,
    name: "Java",
    monacoLang: "java",
  },
  {
    id: 63,
    name: "JavaScript",
    monacoLang: "javascript",
  },
  {
    id: 71,
    name: "Python",
    monacoLang: "python",
  },
  {
    id: 73,
    name: "Rust",
    monacoLang: "rust",
  },
  {
    id: 74,
    name: "TypeScript",
    monacoLang: "typescript",
  },
];

const getLanguageNameById = (languageId: number) => {
  const languageObj = languages.filter((item) => item.id === languageId);
  return languageObj[0].name;
};

export async function POST(request: NextRequest) {
  const { questionId, languageId, code } = await request.json();
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session?.user.id) {
    return NextResponse.json(
      { error: "Need to login before you can make a submission" },
      { status: 401, statusText: "User Not Logged IN" }
    );
  }

  const submitCases: runTestCaseType | null = await prisma.testCase.findUnique({
    where: {
      problemId: questionId,
    },
  });

  if (!submitCases) {
    return NextResponse.json(
      { error: "Submit Cases Not Found" },
      { status: 400, statusText: "Test Cases Not Found" }
    );
  }

  let cases;

  // Handle both string and object formats
  if (typeof submitCases.cases === "string") {
    cases = JSON.parse(submitCases.cases);
  } else {
    cases = JSON.parse(JSON.stringify(submitCases.cases));
  }

  if (!cases || !Array.isArray(cases) || cases.length === 0) {
    return NextResponse.json(
      { error: "Test cases not found for this problem" },
      { status: 404 }
    );
  }

  const submissions = cases.map((item) => ({
    language_id: languageId,
    source_code: code,
    stdin: item.input,
    expected_output: item.output,
  }));

  const JUDGE0_DOMAIN = process.env.JUDGE0_DOMAIN;

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

  let noOfPassedCases = 0;
  let totalMemoryUsed = 0;
  let totalTimeTaken = 0;

  const pollSubmission = async (token: string) => {
    const maxAttempts = 40;
    let attempts = 0;

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

      if (result.status.id > 2) {
        totalMemoryUsed += result.memory;
        totalTimeTaken += Number(result.time);
        if (result.status.description === "Accepted") {
          noOfPassedCases++;
        }
        return result;
      }

      if (result.status.description == "Failed") {
        const languageName = getLanguageNameById(languageId);
        await prisma.selfSubmission.create({
          data: {
            code: code,
            language: languageName,
            noOfPassedCases: noOfPassedCases,
            failedCase: submissions[tokens.indexOf(token)],

            userId: session?.user.id,
            problemId: questionId,
          },
        });

        const failedCaseResponse: submitResponseType = {
          failedCase: submissions[tokens.indexOf(token)],
          noOfPassedCases: noOfPassedCases,
          totalCases: cases.length,
          totalMemoryUsed: totalMemoryUsed,
          totalTimeTaken: totalTimeTaken,
        };

        return NextResponse.json(
          { failedCaseResponse },
          { status: 201, statusText: "A Test Case Failed" }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }

    throw new Error(`Submission ${token} timed out`);
  };

  const responses = await Promise.all(
    tokens.map((token: string) => pollSubmission(token))
  );

  // Reponses have been received about the code execution, all Test Cases have been passed

  const successResponse: submitResponseType = {
    noOfPassedCases: noOfPassedCases,
    totalCases: cases.length,
    totalMemoryUsed: totalMemoryUsed,
    totalTimeTaken: totalTimeTaken,
  };

  await prisma.selfSubmission.create({
    data: {
      code: code,
      language: getLanguageNameById(languageId),
      noOfPassedCases: noOfPassedCases,
      userId: session.user.id,
      problemId: questionId,
    },
  });

  return NextResponse.json(successResponse, {
    status: 201,
    statusText: "Submission Created Successfully",
  });
}
