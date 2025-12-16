"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useAuth } from "@/context/authcontext";
import axios from "axios";
import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

type RowResult =
  | { title: string; result: "created"; number: number }
  | { title: string; result: "error"; message: string };

interface responseType {
  error?: boolean;
  success?: boolean;
  results: RowResult[];
}

function page() {
  const [files, setFiles] = useState<File[] | undefined>();
  const [response, setResponse] = useState<responseType | undefined>();
  const [loading, setLoading] = useState(false);

  const { logout } = useAuth();

  const router = useRouter();

  const exampleTemplate = `[
    {
      title: "Two Sum",
      description: "Given an array of integers and a target,. in Markdown Format",
      difficulty: "EASY",
      source: "Internal",
      tags: ["array", "hashmap"],
      publicTests: [
        { input: "2 7 11 15\\n9", output: "0 1" },
        { input: "1 2 3\\n 3", output: "0 2" },
      ],
      hiddenTests: [{ input: "5 5 5 5\\n10", output: "0 1" }],
    },
    {},
  ];`;

  const uploadProblems = async () => {
    if (!files || files.length === 0) {
      toast.error("Please select a JSON file first.");
      return;
    }

    setLoading(true);
    const file = files[0];

    let jsonText: string;
    try {
      jsonText = await file.text();
    } catch (err) {
      toast.error("Failed to read file.");
      return;
    }

    let json: unknown;
    try {
      json = JSON.parse(jsonText);
    } catch (error) {
      toast.error("Invalid JSON file.");
      console.log(error);
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/admin/uploadproblems", json, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(res);
      setResponse(res.data as responseType);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };
  return (
    <div className="p-5">
      <div className="w-full flex justify-between">
        <div>
          <h1 className="font-logoFont">CODECOLISEUM</h1>
          <h1 className="">Admin Panel</h1>
        </div>
        <div className="">
          <Button
            onClick={() => {
              toast.loading("Logging out");
              logout();
              toast.dismiss();
              router.replace("/login");
            }}
            className="cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>
      <div className="w-full h-[100vh]  flex justify-center items-center">
        <div className="w-[50%] h-[100%] flex flex-col gap-3 mt-10 items-center">
          <div className="w-[400px]">
            <h1 className="mb-2 text-lg">Upload Problems In JSON Format</h1>
            <Dropzone
              className="w-[400px]"
              accept={{
                "application/json": [".json"],
              }}
              maxFiles={1}
              onDrop={handleDrop}
            >
              <DropzoneEmptyState>
                <div className="flex w-full items-center gap-4 p-0">
                  <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <UploadIcon size={24} />
                  </div>
                  <div className="text-left">
                    {!files ? (
                      <div>
                        <p className="font-medium text-sm">
                          Upload a JSON file containing{" "}
                        </p>
                        <p className="font-medium text-sm">
                          Problems in the Provided Format
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Drag and drop or click to upload
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs flex justify-end w-[100%]">
                        {files[0].name}
                      </p>
                    )}
                  </div>
                </div>
              </DropzoneEmptyState>
              <DropzoneContent />
            </Dropzone>
            <div className="w-full flex justify-end mt-2">
              <Button
                className="w-fit cursor-pointer"
                onClick={uploadProblems}
                disabled={loading}
              >
                {loading ? "Wait..." : "Submit"}
              </Button>
            </div>
          </div>
          <div>
            {response && (
              <Card>
                <CardContent>
                  {response.success ? (
                    <h1 className="text-green-400">Accepted</h1>
                  ) : (
                    <h1 className="text-red-400">Declined</h1>
                  )}{" "}
                  <SyntaxHighlighter
                    language="json"
                    style={atomDark}
                    className="rounded-md outline-1"
                  >
                    {JSON.stringify(response.results,null, 2)}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <div className="mx-5 w-[50%] h-full">
          <h1>Problems Must be in this format</h1>
          <SyntaxHighlighter
            language="json"
            style={atomDark}
            className="rounded-md outline-1 overflow-y-scroll"
          >
            {exampleTemplate}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

export default page;
