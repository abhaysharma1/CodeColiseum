import prisma from "@/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const reqbody = await request.json();
    const { questionId, languageId, code } = reqbody;

    const runTestCase: runTestCaseType | null =
      await prisma.runTestCase.findUnique({
        where: {
          problemId: questionId,
        },
      });

    if (!runTestCase) {
      return NextResponse.json(
        { error: "Test cases not found for this problem" },
        { status: 404 }
      );
    }

    let cases;

    // Handle both string and object formats
    if (typeof runTestCase.cases === "string") {
      cases = JSON.parse(runTestCase.cases);
    } else {
      cases = JSON.parse(JSON.stringify(runTestCase.cases));
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

    const batchResponse = await axios.post(
      `${process.env.JUDGE0_DOMAIN}/submissions/batch?base64_encoded=false`,
      { submissions: submissions }
    );

    const tokens = (batchResponse.data as any[]).map((item: any) => item.token);

    // Poll for results
    const pollSubmission = async (token: string): Promise<JudgeResponse> => {
      let attempts = 0;
      const maxAttempts = 30; // Max 15 seconds (30 * 500ms)

      while (attempts < maxAttempts) {
        const statusResponse = await axios.get(
          `${process.env.JUDGE0_DOMAIN}/submissions/${token}?base64_encoded=false`
        );

        const result = statusResponse.data as JudgeResponse;

        // Status IDs: 1=In Queue, 2=Processing, 3+=Finished
        if (result.status.id > 2) {
          return result;
        }

        // Wait 500ms before checking again
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }

      throw new Error(`Submission ${token} timed out`);
    };

    // Poll all submissions in parallel
    const responses = await Promise.all(
      tokens.map((token: string) => pollSubmission(token))
    );


    const reply = { responses: responses, cases: cases };

    return NextResponse.json(reply, { status: 200 });
  } catch (error) {
    console.error("Error running code:", error);
    return NextResponse.json({ error: "Failed to run code" }, { status: 500 });
  }
}
