import { canGiveExam, validateAttempt } from "@/lib/examHelpers";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const reqbody = await req.json();
  const { examId } = reqbody;

  const examDetails = await prisma.exam.findUnique({ where: { id: examId } });

  if (!examDetails) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  let session;
  try {
    session = await canGiveExam(examDetails);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    validateAttempt(examDetails.id, session.user.id);
  } catch (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id,
      examId: examDetails.id,
    },
  });

  const scoreMap = new Map<string, number>();

  for (const s of submissions) {
    const prev = scoreMap.get(s.problemId) ?? 0;
    scoreMap.set(s.problemId, Math.max(s.score, prev));
  }

  const finalScore = Array.from(scoreMap.values()).reduce((a, b) => a + b, 0);

  try {
    const attempt = await prisma.examAttempt.update({
      where: {
        examId_studentId: {
          examId: examDetails.id,
          studentId: session.user.id,
        },
      },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        totalScore: finalScore,
      },
    });

    return NextResponse.json(
      {
        success: true,
        attemptId: attempt.id,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      {
        error: "Failed to submit exam",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
