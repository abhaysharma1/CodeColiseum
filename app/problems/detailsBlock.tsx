"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import TestCases from "./testCases";
import TestCaseRunBlock from "./testCaseRunBlock";
import SubmitCode from "./submitCode";
import { runTestCaseType, submitTestCaseType } from "./interface";
import { Submissions } from "./submissions";

interface descriptionData {
  id: string;
  number: number;
  difficulty: string;
  description: string;
  title: string;
}

function DetailsBlock({
  data,
  loadingDetails,
  runTestCaseResults,
  submitTestCaseResults,
}: {
  data: descriptionData[];
  loadingDetails: boolean;
  runTestCaseResults: runTestCaseType | undefined;
  submitTestCaseResults: submitTestCaseType | undefined;
}) {
  return (
    <div>
      <div
        title="tab navbar"
        className="w-[calc(40vw-2.5rem)] h-[calc(100vh-6.5rem)] overflow-y-scroll scroll-smooth m-5 outline-1 outline-offset-8 rounded-md py-3 px-7  box-border bg-accent/30"
      >
        <Tabs defaultValue="description" className="w-full h-full ">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
            <TabsTrigger value="testcasesrun">Test Results</TabsTrigger>
            <TabsTrigger value="submitcode">Submit Code</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="my-4 mx-1">
            {loadingDetails ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spinner variant="ring" />
              </div>
            ) : (
              <div className="text-foreground ">
                <div className="text-3xl font-bold mb-3">
                  {data[0]?.number}
                  {". "}
                  {data[0]?.title}
                </div>
                <div
                  className="w-fit px-2 py-0.5 flex bg-accent text-center rounded-xl text-xs"
                  style={{
                    color:
                      data[0].difficulty.toLowerCase() === "hard"
                        ? "red"
                        : data[0].difficulty.toLowerCase() === "medium"
                          ? "orange"
                          : "green",
                  }}
                >
                  {data[0]?.difficulty.at(0)?.toUpperCase() +
                    data[0]?.difficulty.slice(1)?.toLowerCase()}
                </div>
                <div className="mt-5">
                  <div className="markdown-wrapper text-foreground mb-6">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {data[0]?.description}
                    </Markdown>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="testcases">
            <TestCases questionId={data[0]?.id} />
          </TabsContent>
          <TabsContent value="testcasesrun">
            <TestCaseRunBlock results={runTestCaseResults} />
          </TabsContent>
          <TabsContent value="submitcode">
            <SubmitCode results={submitTestCaseResults} />
          </TabsContent>
          <TabsContent value="submissions">
            <Submissions problemId={data[0]?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DetailsBlock;
