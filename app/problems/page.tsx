"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import DetailsBlock from "./detailsBlock";
import CodingBlock from "./codingBlock";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar";

interface descriptionData {
  id: string;
  number: number;
  difficulty: string;
  description: string;
  title: string;
}

interface runTestCaseType {
  responses: {
    stdout: string | null;
    time: string | null;
    memory: number | null;
    stderr: string | null;
    token: string;
    compile_output: string | null;
    message: string | null;
    status: {
      id: number;
      description: string;
    };
  }[];
  cases:{
    input:string,
    output:string
  }[]
}
function QuestionSolvingPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [loadingDetails, setLoadingDetails] = useState(true);
  const router = useRouter();

  const [runTestCaseResuts, setRunTestCaseResuts] = useState<runTestCaseType>();

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
        <Navbar01 />
      </div>
      <div className="flex justify-center">
        <div>
          <DetailsBlock
            data={descriptionData || []}
            loadingDetails={loadingDetails}
            runTestCaseResuts={runTestCaseResuts}
          />
        </div>
        <div>
          <CodingBlock
            questionId={id ?? ""}
            setRunTestCaseResuts={setRunTestCaseResuts}
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
