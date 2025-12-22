import { canGiveExam } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqBody = await req.json();
  const { examId } = reqBody;

  let session;

  const examDetails = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!examDetails) {
    return NextResponse.json({ error: "Exam Not Found" }, { status: 404 });
  }

  try {
    session = await canGiveExam(examDetails);
  } catch (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const prevAttempt = await prisma.examAttempt.findFirst({
    where: {
      examId: examDetails.id,
      studentId: session.user.id,
    },
  });

  if (prevAttempt) {
    return NextResponse.json(prevAttempt, { status: 200 });
  }

  const newAttempt = await prisma.examAttempt.create({
    data: {
      examId: examDetails.id,
      studentId: session.user.id,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });

  return NextResponse.json(newAttempt, { status: 201 });
}
