"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TeacherTestResultsResponse } from "@/app/api/teacher/testresults/route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Users, Award, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [data, setData] = useState<TeacherTestResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/teacher/testresults?examId=${examId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch results");
        }

        const results: TeacherTestResultsResponse = await response.json();
        setData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast.error("Failed to load test results");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchResults();
    }
  }, [examId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      SUBMITTED: { variant: "default", label: "Submitted" },
      AUTO_SUBMITTED: { variant: "secondary", label: "Auto-Submitted" },
      IN_PROGRESS: { variant: "outline", label: "In Progress" },
      NOT_STARTED: { variant: "destructive", label: "Not Started" },
      TERMINATED: { variant: "destructive", label: "Terminated" },
    };

    const config = statusMap[status] || {
      variant: "outline" as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSubmissionStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">No Submission</Badge>;

    const statusMap: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      ACCEPTED: { variant: "default", label: "Accepted" },
      PARTIAL: { variant: "secondary", label: "Partial" },
      WRONG_ANSWER: { variant: "destructive", label: "Wrong Answer" },
      TIME_LIMIT: { variant: "destructive", label: "Time Limit" },
      MEMORY_LIMIT: { variant: "destructive", label: "Memory Limit" },
      RUNTIME_ERROR: { variant: "destructive", label: "Runtime Error" },
      COMPILE_ERROR: { variant: "destructive", label: "Compile Error" },
      PENDING: { variant: "outline", label: "Pending" },
      RUNNING: { variant: "outline", label: "Running" },
    };

    const config = statusMap[status] || {
      variant: "outline" as const,
      label: status,
    };
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const exportToCSV = () => {
    if (!data) return;

    const headers = [
      "Student Name",
      "Email",
      "Status",
      "Total Score",
      "Started At",
      "Submitted At",
      ...data.examDetails.problems.map((p) => `Problem ${p.problem.number}`),
    ];

    const rows = data.studentResults.map((student) => [
      student.studentName,
      student.studentEmail,
      student.status,
      student.totalScore.toString(),
      new Date(student.startedAt).toLocaleString(),
      student.submittedAt
        ? new Date(student.submittedAt).toLocaleString()
        : "N/A",
      ...data.examDetails.problems.map((p) => {
        const problemScore = student.problemScores.find(
          (ps) => ps.problemId === p.problem.id
        );
        return problemScore ? problemScore.bestScore.toString() : "0";
      }),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.examDetails.title}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Results exported successfully");
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || "Failed to load results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SiteHeader name={"See Test Results"} />
      {loading || !data ? (
        <div className="h-full w-full flex justify-center items-center">
          <Spinner variant="infinite" />
        </div>
      ) : (
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">{data.examDetails.title}</h1>
              </div>
              <p className="text-muted-foreground">
                {data.examDetails.description || "Test results overview"}
              </p>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.statistics.totalStudents}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.statistics.submitted} submitted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.statistics.averageScore}
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of total points
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Highest Score
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.statistics.highestScore}
                </div>
                <p className="text-xs text-muted-foreground">
                  Best performance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.statistics.totalStudents > 0
                    ? Math.round(
                        (data.statistics.submitted /
                          data.statistics.totalStudents) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.statistics.inProgress} in progress
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Scores</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Results</CardTitle>
                  <CardDescription>
                    Overview of all student attempts and scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Score</TableHead>
                        <TableHead>Started At</TableHead>
                        <TableHead>Submitted At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.studentResults.map((student, index) => (
                        <TableRow key={student.attemptId}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>{student.studentName}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.studentEmail}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(student.status)}
                          </TableCell>
                          <TableCell className="font-bold">
                            {student.totalScore}
                          </TableCell>
                          <TableCell>
                            {new Date(student.startedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {student.submittedAt
                              ? new Date(student.submittedAt).toLocaleString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {data.studentResults.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No student attempts yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Problem Scores</CardTitle>
                  <CardDescription>
                    Individual problem performance for each student
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">
                            Student Name
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          {data.examDetails.problems.map((problem) => (
                            <TableHead
                              key={problem.problem.id}
                              className="text-center"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold">
                                  P{problem.problem.number}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {problem.problem.title}
                                </span>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.studentResults.map((student) => (
                          <TableRow key={student.attemptId}>
                            <TableCell className="font-medium">
                              {student.studentName}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(student.status)}
                            </TableCell>
                            <TableCell className="font-bold">
                              {student.totalScore}
                            </TableCell>
                            {data.examDetails.problems.map((problem) => {
                              const problemScore = student.problemScores.find(
                                (ps) => ps.problemId === problem.problem.id
                              );
                              return (
                                <TableCell
                                  key={problem.problem.id}
                                  className="text-center"
                                >
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-semibold">
                                      {problemScore?.bestScore || 0}
                                    </span>
                                    {problemScore &&
                                      problemScore.attempts > 0 && (
                                        <>
                                          <span className="text-xs text-muted-foreground">
                                            {problemScore.attempts}{" "}
                                            {problemScore.attempts === 1
                                              ? "attempt"
                                              : "attempts"}
                                          </span>
                                          {getSubmissionStatusBadge(
                                            problemScore.status
                                          )}
                                        </>
                                      )}
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {data.studentResults.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No student attempts yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Duration
                </p>
                <p className="text-lg font-semibold">
                  {data.examDetails.durationMin} minutes
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Published
                </p>
                <p className="text-lg font-semibold">
                  {data.examDetails.isPublished ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Start Date
                </p>
                <p className="text-lg font-semibold">
                  {new Date(data.examDetails.startDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  End Date
                </p>
                <p className="text-lg font-semibold">
                  {new Date(data.examDetails.endDate).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default TestResultsPage;
