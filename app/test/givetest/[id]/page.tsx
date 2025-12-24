"use client";
import { Button } from "@/components/ui/button";
import {
  Exam,
  ExamAttempt,
  ExamProblem,
  Problem,
  RunTestCase,
} from "@/interfaces/DB Schema";
import handleExamError from "@/utils/examErrorHandler";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Description from "./Description";
import { toast } from "sonner";
import CodingEditor from "./codingEditor";
import { Separator } from "@/components/ui/separator";
import { getLanguageId } from "@/utils/getLanguageId";
import { runTestCaseType } from "./interface";
import { SubmitCodeResponse } from "@/app/api/tests/submitcode/route";
import { useRemainingTime } from "./getRemainingTime";

function page() {
  const params = useParams();
  const examId = params.id as string;

  const [examDetails, setExamDetails] = useState<Exam | undefined>();
  const [examProblems, setExamProblems] = useState<ExamProblem[] | undefined>();
  const [examAttempt, setExamAttempt] = useState<ExamAttempt | undefined>();

  const [currProblem, setCurrProblem] = useState<number | undefined>(1);

  const [error, setError] = useState<any>();

  const [descriptionData, setDescriptionData] = useState<Problem | undefined>();
  const [testCases, setTestCases] = useState<RunTestCase | undefined>();

  const [code, setCode] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [language, setLanguage] = useState("cpp");
  const [runningResults, setRunningResults] = useState<
    runTestCaseType | undefined
  >();
  const [submittingResults, setSubmittingResults] = useState<
    SubmitCodeResponse | undefined
  >();

  const remainingTime = useRemainingTime(examAttempt?.expiresAt || new Date(0));

  const router = useRouter();

  useEffect(() => {
    const getTestDetails = async () => {
      try {
        const res = await axios.post("/api/tests/gettestdetails", {
          examId,
        });
        setExamDetails(res.data as Exam);
      } catch (err: any) {
        if (err.status == 401) {
          toast.error("You are not allowed to give this Test");
          router.replace("/dashboard");
        }
        handleExamError(err);
        setError(err);
      }
    };
    getTestDetails();
  }, [examId]);

  useEffect(() => {
    if (!examDetails?.id) return;

    const run = async () => {
      try {
        const [problemsRes, attemptRes] = await Promise.all([
          axios.post("/api/tests/gettestproblems", { examId: examDetails.id }),
          axios.post("/api/tests/starttest", { examId: examDetails.id }),
        ]);

        setExamProblems(problemsRes.data as ExamProblem[]);
        setExamAttempt(attemptRes.data as ExamAttempt);
      } catch (err: any) {
        setError(err);
      }
    };

    run();
  }, [examDetails?.id]);

  useEffect(() => {
    if (currProblem && examProblems) {
      const getDescriptionData = async () => {
        try {
          const res = await axios.post("/api/tests/getproblemdescription", {
            problemId: examProblems[currProblem - 1].problemId,
          });
          setDescriptionData(res.data as Problem);
        } catch (error: any) {
          if (error.status == 400 || error.status == 500) {
            toast.error("Didn't Found Your Problem");
            return;
          }
          toast.error(error);
        }
      };
      const getTestCases = async () => {
        try {
          const res = await axios.post("/api/tests/gettestcases", {
            questionId: examProblems[currProblem - 1].problemId,
          });
          setTestCases(res.data as RunTestCase);
        } catch (error: any) {
          toast.error(error);
        }
      };

      getDescriptionData();
      getTestCases();
    }
  }, [currProblem, examProblems]);

  useEffect(() => {
    if (remainingTime === 0) {
      submitExam();
    }
  }, [remainingTime]);

  const onRun = async () => {
    if (!examDetails || !examProblems || !currProblem) {
      return;
    }
    if (!code || code.length < 2) {
      toast.error("Please provide some code");
      return;
    }
    if (!language) {
      toast.error("Please select a language");
      return;
    }
    try {
      setRunning(true);
      const languageId = getLanguageId(language) ?? 54;

      const sentData = {
        questionId: examProblems[currProblem - 1].problemId,
        languageId,
        code,
      };

      try {
        const response = await axios.post("/api/problems/runcode", sentData);
        setRunningResults(response.data as runTestCaseType);
      } catch (error) {
        console.log(error);
      } finally {
        setRunning(false);
      }
    } catch (error: any) {
      toast.error(error);
      console.log(error);
    } finally {
      setRunning(false);
    }
  };

  const onSubmit = async () => {
    if (!examDetails || !examProblems || !currProblem) {
      return;
    }
    if (!code || code.length < 2) {
      toast.error("Please provide some code");
      return;
    }
    if (!language) {
      toast.error("Please select a language");
      return;
    }
    setSubmitting(true);
    const languageId = getLanguageId(language);
    const sentData = {
      languageId: languageId,
      code: code,
      examDetails: examDetails,
      examAttempt: examAttempt,
      problemId: examProblems[currProblem - 1].problemId,
    };
    try {
      const res = await axios.post("/api/tests/submitcode", sentData);
      setSubmittingResults(res.data as SubmitCodeResponse);
    } catch (error: any) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitExam = async () => {
    try {
      setSubmittingExam(true);
      const res = await axios.post("/api/tests/submittest", {
        examId: examDetails?.id,
      });
      if (res.status == 200) {
        toast.success("Your Test has been Submitted");
        router.replace("/dashboard");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmittingExam(false);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Something went wrong. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="w-full flex justify-between items-center h-13 px-5 ">
        <div className="font-logoFont font-bold">CODECOLISEUM</div>
        <div>{examDetails?.title}</div>
        <div>Remaining Time: {Math.floor(remainingTime / 60)} min</div>
        <div>
          <Button
            className="h-8 cursor-pointer"
            variant={"secondary"}
            onClick={submitExam}
            disabled={submittingExam}
          >
            {submittingExam ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      </div>
      <Separator></Separator>
      <div className="flex p-2 gap-3">
        <div className="w-fit h-[calc(100vh-7rem)] overflow-y-scroll scroll-smooth m-5 outline-1 outline-offset-8 rounded-md  px-4 py-3 box-border bg-accent/30">
          <h1 className="mb-4">Problem List</h1>
          <div className="grid grid-cols-2 gap-2">
            {examProblems?.map((p) => (
              <div className="" key={p.id}>
                <Button
                  variant={currProblem == p.order ? "default" : "outline"}
                  onClick={() => setCurrProblem(p.order)}
                >
                  {p.order}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Description
            descriptionData={descriptionData}
            testcases={testCases}
            runningResults={runningResults}
            attemptId={examAttempt?.id}
            problemId={examProblems && currProblem ? examProblems[currProblem - 1]?.problemId : undefined}
            submittingResults={submittingResults}
          />
        </div>
        <div className="flex-1">
          <CodingEditor
            code={code}
            running={running}
            submitting={submitting}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            onRun={onRun}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default page;
