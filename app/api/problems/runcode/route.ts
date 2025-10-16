import { description } from "@/components/chart-area-interactive";
import prisma from "@/lib/prisma";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

type TestCase = {
  input: string;
  output: string;
};

interface ResponseFromJudge {
  data: {
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
  };
}

export async function POST(request: NextRequest) {
  const reqbody = await request.json();
  const { questionId, code } = reqbody;

  const runTestCase = await prisma.runTestCase.findUnique({
    where: {
      problemId: questionId,
    },
  });

  const cases = runTestCase?.cases as TestCase[];

  // cases.map(async (item) => {
  //   const codeToJudge = {
  //     language_id: 52, //C++
  //     source_code: code,
  //     stdin: item.input ?? null,
  //     expected_output: item.output,
  //   };

  //   const responseFromJudge = await axios.post(
  //     `${process.env.JUDGE0_DOMAIN}/submissions?base64_encoded=false&wait=true`,
  //     codeToJudge
  //   );

  //   console.log(responseFromJudge);
  // });

  const codeToJudge = {
    language_id: 52, //C++
    source_code: code,
    stdin: cases[0].input ?? null,
    expected_output: cases[0].output,
  };

  const responseFromJudge = await axios.post(
    `${process.env.JUDGE0_DOMAIN}/submissions?base64_encoded=false&wait=true`,
    codeToJudge
  );

  const data = responseFromJudge.data as ResponseFromJudge;
  console.log(data);

  return NextResponse.json(
    { data: data },
    { status: 201, statusText: "Something" }
  );
}
