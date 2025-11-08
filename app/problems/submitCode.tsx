import React, { useEffect } from "react";
import { submitTestCaseType } from "./interface";
import { CasesPassedChart } from "@/components/casesPassedChart";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitCode({ results }: { results: submitTestCaseType | undefined }) {
  useEffect(() => {
    console.log(results);
  }, [results]);

  if (!results || !results.noOfPassedCases) {
    return (
      <div className="p-4">
        Please Submit Your Code to see current Submission
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="animate-fade-right animate-once">
        {results.status == "Passed" ? (
          <div className="text-green-600">Passed</div>
        ) : (
          <div className="text-red-600">Failed</div>
        )}
      </div>
      <div>
        <div className="mt-3 text-foreground/80 animate-fade-right animate-once">
          {results.totalMemoryUsed && results.totalTimeTaken && (
            <div>
              <div>
                Memory Used: {(results.totalMemoryUsed / 1024).toFixed(2)} mb
              </div>
              <div>Time Taken: {results.totalTimeTaken?.toFixed(2)} sec</div>
            </div>
          )}
          {results.failedCaseExecutionDetails && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Failed Case</CardTitle>
                  <CardDescription>
                    The following case has failed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md">
                    <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-t-md">
                      Input
                      <br />
                      {results.failedCase?.stdin}
                    </div>
                    <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces">
                      Expected Output
                      <br />
                      {results.failedCase?.expected_output}
                    </div>
                    <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-b-md">
                      Your Output
                      <br />
                      {results.failedCaseExecutionDetails.stdout}
                    </div>
                    {results.failedCaseExecutionDetails.stderr && (
                      <div className="p-2 px-4 dark:bg-background/40 bg-foreground/10 whitespace-break-spaces rounded-md">
                        Error
                        <br />
                        {results.failedCaseExecutionDetails.stderr}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <p>Please Refactor your Code</p>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
        {results.status == "Passed" && (
          <div className="mt-3 animate-fade animate-once">
            <CasesPassedChart
              noOfPassedCases={results.noOfPassedCases}
              totalCases={results.totalCases}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitCode;
