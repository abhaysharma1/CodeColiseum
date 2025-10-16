"use client";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import axios from "axios";
import React, { useEffect, useState } from "react";

export interface TestCase {
  input: string;
  output: string;
}

export interface RunTestCase {
  id: string;
  problemId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  cases: TestCase[];
}

export interface GetProblemTestCasesResponse {
  data: RunTestCase;
}

function TestCases({ questionId }: { questionId: string }) {
  const [testData, setTestData] = useState<RunTestCase | null>(null);

  const [loading, setLoading] = useState(true);

  const getCases = async () => {
    try {
      setLoading(true);
      const res = await axios.get<GetProblemTestCasesResponse>(
        `/api/problems/getproblemtestcases?id=${questionId}`
      );
      setTestData(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(testData);
  }, [testData]);

  useEffect(() => {
    if (questionId) {
      getCases();
    }
  }, [questionId]);

  return (
    <div className="mt-7 ml-3 flex flex-col h-full">
      <div className=" flex flex-col h-full">
        {loading ? (
          <div className="w-full flex flex-col justify-center items-center">
            <Spinner variant="ring" />
          </div>
        ) : (
          <div className="text-white">
            <div className="mb-2">Input : Output</div>
            {testData?.cases?.map((item, index) => (
              <div
                className="text-foreground/70 w-full flex justify-between"
                key={item.input}
              >
                <div>{JSON.parse(item.input).join(", ")}</div>
                <div>{item.output}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestCases;
