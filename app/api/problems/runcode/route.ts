import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import axios from "axios";
import { headers } from "next/headers";
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

// 🧠 Utility: build headers dynamically based on environment
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

export async function POST(request: NextRequest) {
  try {
    const reqbody = await request.json();
    const { questionId, languageId, code } = reqbody;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return NextResponse.json(
        { error: "Need to login before you can make a run your code" },
        { status: 401, statusText: "User Not Logged IN" }
      );
    }

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

    // 🌍 Choose the correct Judge0 domain
    const JUDGE0_DOMAIN = process.env.JUDGE0_DOMAIN;

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

    // ⏳ Poll function with environment-aware headers
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

    // 🔁 Poll all submissions concurrently
    const responses = await Promise.all(
      tokens.map((token: string) => pollSubmission(token))
    );

    const reply = { responses, cases };

    return NextResponse.json(reply, { status: 200 });
  } catch (error: any) {
    console.error("Error running code:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to run code" }, { status: 500 });
  }
}
