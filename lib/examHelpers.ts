import { Exam } from "@/interfaces/DB Schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "./prisma";

export async function isStudent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not Logged In");
  }

  if (session?.user.role !== "STUDENT") {
    throw new Error("Not a Student");
  }
  return { session };
}

export async function canGiveExam(examDetails: Exam) {
  const { session } = await isStudent();

  const now = Date.now();
  const start = new Date(examDetails.startDate).getTime();
  const end = new Date(examDetails.endDate).getTime();

  const allowed = await prisma.examGroup.findFirst({
    where: {
      examId: examDetails.id,
      group: {
        members: {
          some: {
            studentId: session.user.id,
          },
        },
      },
    },
    select: { id: true },
  });

  if (!allowed) {
    throw new Error("Student Not Allowed");
  }

  if (start > now) {
    throw new Error("Exam Not Started");
  } else if (end < now) {
    throw new Error("Exam has ended");
  }

  if (!examDetails.isPublished) {
    throw new Error("Exam is not Published");
  }

  const attempted = await prisma.examAttempt.findFirst({
    where: {
      examId: examDetails.id,
      studentId: session.user.id,
    },
  });

  if (
    attempted &&
    attempted.status !== "NOT_STARTED" &&
    attempted.status !== "IN_PROGRESS"
  ) {
    throw new Error("Already Attempted");
  }

  return session;
}
