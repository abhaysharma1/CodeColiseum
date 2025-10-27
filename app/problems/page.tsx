"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import DetailsBlock from "./detailsBlock";
import CodingBlock from "./codingBlock";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

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
    <div className="flex justify-center">
      <div>
        <DetailsBlock
          data={descriptionData || []}
          loadingDetails={loadingDetails}
        />
      </div>
      <div>
        <CodingBlock questionId={id ?? ""} />
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
