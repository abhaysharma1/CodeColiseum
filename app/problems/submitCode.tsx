import React, { useEffect } from "react";
import { submitTestCaseType } from "./interface";
import { CasesPassedChart } from "@/components/casesPassedChart";

function SubmitCode({ results }: { results: submitTestCaseType | undefined }) {

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
        {results.noOfPassedCases == results.totalCases ? (
          <div className="text-green-600">Passed</div>
        ) : (
          <div className="text-green-600">Failed</div>
        )}
      </div>
      <div>
        <div className="mt-3 text-foreground/80 animate-fade-right animate-once">
          <div>
            Memory Used: {(results.totalMemoryUsed / 1024).toFixed(2)} mb
          </div>
          <div>Time Taken: {results.totalTimeTaken.toFixed(2)} sec</div>
        </div>
        <div className="mt-3 animate-fade animate-once">
          <CasesPassedChart
            noOfPassedCases={results.noOfPassedCases}
            totalCases={results.totalCases}
          />
        </div>
      </div>
    </div>
  );
}

export default SubmitCode;
