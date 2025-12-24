import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ExamAttemptStatus, SubmissionStatus } from "@/generated/prisma/client";
import { isStudent } from "@/lib/examHelpers";

// TypeScript Types for the API Response
export type ExamResultResponse = {
  examDetails: {
    id: string;
    title: string;
    description: string | null;
    durationMin: number;
    startDate: Date;
    endDate: Date;
    creator: {
      id: string;
      name: string;
      email: string;
    };
    problems: Array<{
      order: number;
      problem: {
        id: string;
        number: number;
        title: string;
        difficulty: string;
      };
    }>;
  };
  examAttempt: {
    id: string;
    status: ExamAttemptStatus;
    startedAt: Date;
    expiresAt: Date;
    submittedAt: Date | null;
    totalScore: number;
  };
  finalScore: number;
  submissionReports: Array<{
    problemId: string;
    submissionId: string;
    code: string;
    language: string;
    status: SubmissionStatus;
    score: number;
    result: any; // JSON field from Prisma
    createdAt: Date;
    isSuccessful: boolean;
  }>;
  ranking: {
    currentStudent:
      | {
          rank: number;
          studentId: string;
          studentName: string;
          studentEmail: string;
          totalScore: number;
          submittedAt: Date | null;
        }
      | undefined;
    allRankings: Array<{
      rank: number;
      studentId: string;
      studentName: string;
      studentEmail: string;
      totalScore: number;
      submittedAt: Date | null;
    }>;
  };
};

export type ExamResultRequest = {
  examId: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExamResultRequest;
    const { examId } = body;

    const session = await isStudent();
    const studentId = session.session.user.id;

    if (!examId || !studentId) {
      return NextResponse.json(
        { error: "examId and studentId are required" },
        { status: 400 }
      );
    }

    const examDetails = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        problems: {
          include: {
            problem: {
              select: {
                id: true,
                number: true,
                title: true,
                difficulty: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!examDetails) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const examAttempt = await prisma.examAttempt.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId,
        },
      },
    });

    if (!examAttempt) {
      return NextResponse.json(
        { error: "Exam attempt not found" },
        { status: 404 }
      );
    }

    const finalScore = examAttempt.totalScore;

    const allSubmissions = await prisma.submission.findMany({
      where: {
        attemptId: examAttempt.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const problemSubmissionsMap = new Map<string, typeof allSubmissions>();

    allSubmissions.forEach((submission) => {
      if (!problemSubmissionsMap.has(submission.problemId)) {
        problemSubmissionsMap.set(submission.problemId, []);
      }
      problemSubmissionsMap.get(submission.problemId)!.push(submission);
    });

    // Get successful submission report or last submission for each problem
    const submissionReports = Array.from(problemSubmissionsMap.entries()).map(
      ([problemId, submissions]) => {
        // Find first successful submission (status: ACCEPTED)
        const successfulSubmission = submissions.find(
          (sub) => sub.status === "ACCEPTED"
        );

        // If no successful submission, get the last one
        const reportSubmission =
          successfulSubmission || submissions[submissions.length - 1];

        return {
          problemId,
          submissionId: reportSubmission.id,
          code: reportSubmission.sourceCode,
          language: reportSubmission.language,
          status: reportSubmission.status,
          score: reportSubmission.score,
          result: reportSubmission.result,
          createdAt: reportSubmission.createdAt,
          isSuccessful: reportSubmission.status === "ACCEPTED",
        };
      }
    );

    // 5. Get Ranking
    const allAttempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        status: {
          in: ["SUBMITTED", "AUTO_SUBMITTED"],
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { totalScore: "desc" },
        { submittedAt: "asc" }, // Earlier submission as tiebreaker
      ],
    });

    const ranking = allAttempts.map((attempt, index) => ({
      rank: index + 1,
      studentId: attempt.studentId,
      studentName: attempt.student.name,
      studentEmail: attempt.student.email,
      totalScore: attempt.totalScore,
      submittedAt: attempt.submittedAt,
    }));

    const currentStudentRanking = ranking.find(
      (rank) => rank.studentId === studentId
    );

    // Return all the requested data
    return NextResponse.json<ExamResultResponse>({
      examDetails: {
        id: examDetails.id,
        title: examDetails.title,
        description: examDetails.description,
        durationMin: examDetails.durationMin,
        startDate: examDetails.startDate,
        endDate: examDetails.endDate,
        creator: examDetails.creator,
        problems: examDetails.problems.map((ep) => ({
          order: ep.order,
          problem: ep.problem,
        })),
      },
      examAttempt: {
        id: examAttempt.id,
        status: examAttempt.status,
        startedAt: examAttempt.startedAt,
        expiresAt: examAttempt.expiresAt,
        submittedAt: examAttempt.submittedAt,
        totalScore: examAttempt.totalScore,
      },
      finalScore,
      submissionReports,
      ranking: {
        currentStudent: currentStudentRanking,
        allRankings: ranking,
      },
    });
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
