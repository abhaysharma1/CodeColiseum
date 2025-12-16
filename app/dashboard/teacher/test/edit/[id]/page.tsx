"use client";

import fetchExam from "@/app/actions/teacher/tests/fetchExam";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { exam } from "@/interfaces/interface";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";

function Page() {
  const params = useParams();
  const examId = params.id as string;

  const [examDetails, setExamDetails] = useState<exam | undefined>();

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    async function getExamDetails() {
      setLoading(true);
      const data = await fetchExam(examId);
      setExamDetails(data as exam);
      setLoading(false);
    }
    getExamDetails();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner variant="infinite" />
      </div>
    );
  }

  return (
    <div>
      <div>
        <SiteHeader name="Edit Test" />
      </div>
      <div className="px-8 py-5">
        <Input value={examDetails?.title} />
      </div>
    </div>
  );
}

export default Page;
