"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Problem, RunTestCase, TestCaseItem } from "@/interfaces/DB Schema";
import { Separator } from "@/components/ui/separator";
import { runTestCaseType } from "./interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Description({
  descriptionData,
  testcases,
  runningResults,
}: {
  descriptionData: Problem | undefined;
  testcases: RunTestCase | undefined;
  runningResults: runTestCaseType | undefined;
}) {
  const [jsonCases, setJsonCases] = useState<TestCaseItem[] | undefined>();

  useEffect(() => {
    if (testcases) {
      try {
        // Check if cases is already an object or a string
        const converted = typeof testcases.cases === 'string' 
          ? JSON.parse(testcases.cases) 
          : testcases.cases;
        setJsonCases(converted);
      } catch (error) {
        console.error("Failed to parse test cases:", error);
        setJsonCases(undefined);
      }
    }
  }, [testcases]);

  return (
    <div>
      <div
        title="tab navbar"
        className="w-[calc(35vw-2.5rem)] h-[calc(100vh-7rem)] overflow-y-scroll scroll-smooth m-5 outline-1 outline-offset-8 rounded-md py-3 px-7  box-border bg-accent/30"
      >
        <Tabs defaultValue="description" className="w-full h-full ">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
            <TabsTrigger value="runresults">Run Results</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="my-4 mx-1">
            {!descriptionData ? (
              <div className="w-full h-full flex justify-center items-center">
                <Spinner variant="ring" />
              </div>
            ) : (
              <div className="text-foreground ">
                <div className="text-3xl font-bold mb-3">
                  {descriptionData?.number}
                  {". "}
                  {descriptionData?.title}
                </div>
                <div
                  className="w-fit px-2 py-0.5 flex bg-accent text-center rounded-xl text-xs"
                  style={{
                    color:
                      descriptionData.difficulty.toLowerCase() === "hard"
                        ? "red"
                        : descriptionData.difficulty.toLowerCase() === "medium"
                          ? "orange"
                          : "green",
                  }}
                >
                  {descriptionData?.difficulty.at(0)?.toUpperCase() +
                    descriptionData?.difficulty.slice(1)?.toLowerCase()}
                </div>
                <div className="mt-5">
                  <div className={`markdown-wrapper text-foreground mb-6 `}>
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {descriptionData?.description}
                    </Markdown>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="testcases" className="my-4 mx-1">
            <div className="mt-7 flex flex-col h-full">
              <div className=" flex flex-col h-full">
                {!testcases ? (
                  <div className="w-full flex flex-col justify-center items-center">
                    <Spinner variant="ring" />
                  </div>
                ) : (
                  <div className="">
                    <div className="mb-2 w-full flex justify-between px-10">
                      <div>Input</div>
                      <div>Output</div>
                    </div>
                    {jsonCases?.map((item, index) => (
                      <div
                        className="text-foreground/70 w-full whitespace-pre-line"
                        key={item.input}
                      >
                        <div className="my-3 flex w-full justify-between pl-10">
                          <div>{item.input}</div>
                          <div className="pr-14">{item.output}</div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="runresults" className="my-4 mx-1">
            <div className="">
              {!runningResults ? (
                <div>Please Run your code to see results</div>
              ) : (
                runningResults?.responses.map((item, index) => (
                  <div
                    key={item.token}
                    className="my-4 animate-fade-down animate-once animate-delay-[10ms]"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Test {index + 1}</CardTitle>
                        <CardDescription className="flex justify-between">
                          <div>
                            Time taken: {Number(item.time).toFixed(2)} sec
                            <br />
                            Memory used:{" "}
                            {(item.memory && item.memory / 1024)?.toFixed(2)} mb
                          </div>
                          <div>
                            {item.status.description === "Accepted" ? (
                              <span className="text-green-600">Accepted</span>
                            ) : (
                              <span className="text-red-600">Failed</span>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md">
                          <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-t-md">
                            Input
                            <br />
                            {runningResults?.cases[index].input}
                          </div>
                          <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces">
                            Expected Output
                            <br />
                            {runningResults.cases[index].output}
                          </div>
                          <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-b-md">
                            Your Output
                            <br />
                            {item.stdout}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Description;
