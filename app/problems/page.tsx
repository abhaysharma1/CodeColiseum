"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import DetailsBlock from "./detailsBlock";
import CodingBlock from "./codingBlock";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar";
import { runTestCaseType, submitTestCaseType } from "./interface";
import { AuthProvider } from "@/context/authcontext";

interface descriptionData {
  id: string;
  number: number;
  difficulty: string;
  description: string;
  title: string;
}

function QuestionSolvingPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [loadingDetails, setLoadingDetails] = useState(true);
  const router = useRouter();

  const [runTestCaseResults, setRunTestCaseResults] =
    useState<runTestCaseType>();
  const [submitTestCaseResults, setSubmitTestCaseResults] =
    useState<submitTestCaseType>();

  const [descriptionData, setDescriptionData] = useState<descriptionData[]>([]);

  const getProblemDescription = async () => {
    try {
      const response = await axios.post(
        `/api/problems/getproblems?page=1&limit=1`,
        {
          searchValue: id,
        }
      );
      setDescriptionData(response.data as descriptionData[]);
    } catch (error: any) {
      if (error.status == 400 || error.status == 500) {
        toast.error("Didn't Found Your Problem");
        router.replace("/not-found");
        return;
      }
      toast.error(error);
    }
  };

  useEffect(() => {
    if (descriptionData[0]?.id) {
      setLoadingDetails(false);
    }
  }, [descriptionData]);

  useEffect(() => {
    getProblemDescription();
  }, []);

  return (
    <div>
      <div>
        <AuthProvider>
          <Navbar01 />
        </AuthProvider>
      </div>
      <div className="flex justify-center">
        <div>
          <DetailsBlock
            data={descriptionData || []}
            loadingDetails={loadingDetails}
            runTestCaseResults={runTestCaseResults}
            submitTestCaseResults={submitTestCaseResults}
          />
        </div>
        <div>
          <CodingBlock
            questionId={id ?? ""}
            setRunTestCaseResults={setRunTestCaseResults}
            setSubmitTestCaseResults={setSubmitTestCaseResults}
          />
        </div>
      </div>
    </div>
  );
}

function QuestionSolvingPage() {
  return (
    <Suspense
      fallback={
        <div>
          <Spinner variant="ring" />
        </div>
      }
    >
      <QuestionSolvingPageContent />
    </Suspense>
  );
}

export default QuestionSolvingPage;
