import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type TeacherTestResultsResponse = {
  examDetails: {
    id: string;
    title: string;
    description: string | null;
    durationMin: number;
    startDate: Date;
    endDate: Date;
    isPublished: boolean;
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
  studentResults: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    attemptId: string;
    status: string;
    startedAt: Date;
    submittedAt: Date | null;
    expiresAt: Date;
    totalScore: number;
    problemScores: Array<{
      problemId: string;
      problemTitle: string;
      problemNumber: number;
      bestScore: number;
      attempts: number;
      status: string | null;
    }>;
  }>;
  statistics: {
    totalStudents: number;
    submitted: number;
    inProgress: number;
    notStarted: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
};

export async function GET(request: NextRequest) {
  try {
    // Check if user is a teacher
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Not authorized. Teacher access required." },
        { status: 403 }
      );
    }

    const teacherId = session.user.id;
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");

    if (!examId) {
      return NextResponse.json(
        { error: "examId is required" },
        { status: 400 }
      );
    }

    // Fetch exam details and verify teacher owns it
    const examDetails = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
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

    if (examDetails.creatorId !== teacherId) {
      return NextResponse.json(
        { error: "Not authorized to view this exam's results" },
        { status: 403 }
      );
    }

    // Fetch all exam attempts for this exam
    const examAttempts = await prisma.examAttempt.findMany({
      where: {
        examId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        submissions: {
          select: {
            id: true,
            problemId: true,
            status: true,
            score: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { totalScore: "desc" },
        { submittedAt: "asc" },
      ],
    });

    // Process student results
    const studentResults = examAttempts.map((attempt) => {
      // Group submissions by problem
      const problemSubmissions = new Map<
        string,
        Array<{ status: string; score: number }>
      >();

      attempt.submissions.forEach((sub) => {
        if (!problemSubmissions.has(sub.problemId)) {
          problemSubmissions.set(sub.problemId, []);
        }
        problemSubmissions.get(sub.problemId)!.push({
          status: sub.status,
          score: sub.score,
        });
      });

      // Calculate problem scores
      const problemScores = examDetails.problems.map((examProblem) => {
        const submissions = problemSubmissions.get(examProblem.problemId) || [];
        const bestScore = submissions.length > 0
          ? Math.max(...submissions.map((s) => s.score))
          : 0;
        
        const bestSubmission = submissions.find(s => s.score === bestScore);
        
        return {
          problemId: examProblem.problemId,
          problemTitle: examProblem.problem.title,
          problemNumber: examProblem.problem.number,
          bestScore,
          attempts: submissions.length,
          status: bestSubmission?.status || null,
        };
      });

      return {
        studentId: attempt.student.id,
        studentName: attempt.student.name,
        studentEmail: attempt.student.email,
        attemptId: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        expiresAt: attempt.expiresAt,
        totalScore: attempt.totalScore,
        problemScores,
      };
    });

    // Calculate statistics
    const submittedAttempts = examAttempts.filter(
      (a) => a.status === "SUBMITTED" || a.status === "AUTO_SUBMITTED"
    );
    const inProgressAttempts = examAttempts.filter(
      (a) => a.status === "IN_PROGRESS"
    );
    const notStartedAttempts = examAttempts.filter(
      (a) => a.status === "NOT_STARTED"
    );

    const scores = submittedAttempts.map((a) => a.totalScore);
    const averageScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    const statistics = {
      totalStudents: examAttempts.length,
      submitted: submittedAttempts.length,
      inProgress: inProgressAttempts.length,
      notStarted: notStartedAttempts.length,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore,
      lowestScore,
    };

    return NextResponse.json<TeacherTestResultsResponse>({
      examDetails: {
        id: examDetails.id,
        title: examDetails.title,
        description: examDetails.description,
        durationMin: examDetails.durationMin,
        startDate: examDetails.startDate,
        endDate: examDetails.endDate,
        isPublished: examDetails.isPublished,
        problems: examDetails.problems.map((ep) => ({
          order: ep.order,
          problem: ep.problem,
        })),
      },
      studentResults,
      statistics,
    });
  } catch (error) {
    console.error("Error fetching teacher test results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
