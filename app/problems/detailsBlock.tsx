"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import TestCases from "./testCases";
import TestCaseRunBlock from "./testCaseRunBlock";
import SubmitCode from "./submitCode";

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
  cases: {
    input: string;
    output: string;
  }[];
}

function DetailsBlock({
  data,
  loadingDetails,
  runTestCaseResuts,
}: {
  data: descriptionData[];
  loadingDetails: boolean;
  runTestCaseResuts: runTestCaseType | undefined;
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
                <div className="w-fit px-2 pb-0.5 bg-accent text-center rounded-xl text-sm">
                  {data[0]?.difficulty}
                </div>
                <div className="mt-5">
                  <div className="markdown-wrapper text-foreground mb-6">
                    <Markdown remarkPlugins={[remarkBreaks]}>
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
            <TestCaseRunBlock results={runTestCaseResuts} />
          </TabsContent>
          <TabsContent value="submitcode">
            <SubmitCode />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DetailsBlock;
