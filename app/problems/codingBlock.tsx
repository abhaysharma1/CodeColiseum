"use client";
import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Button } from "@/components/ui/button";
import { IoMdSettings } from "react-icons/io";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";
import { NextApiResponse } from "next";

interface sentCode {
  questionId: string;
  code: string;
}

function CodingBlock({ questionId }: { questionId: string }) {
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const { theme, setTheme } = useTheme();
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState("javascript");
  const [editorInFocus, setEditorInFocus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);

  const onRun = async ({ mode }: { mode: string }) => {
    // Put Code Running Logic Here
    setRunning(true);
    if ((code && code?.length < 1) || code == "//Example Code") {
      toast.error("Please Type Something");
      setRunning(false);
      return;
    }
    const sentData: sentCode = {
      questionId: questionId,
      code: code,
    };

    try {
      const response = await axios.post("/api/problems/runcode", sentData);

      if (response.status > 400) {
        toast.error("Couldn't run you code");
        toast.error(response.statusText);
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    setEditorTheme(theme === "light" ? "light" : "vs-dark");
  }, [theme]);

  return (
    <div>
      <div
        title="tab navbar"
        className="w-[calc(60vw-2.5rem)] h-[calc(100vh-2.5rem)] outline-1 m-5 outline-offset-4 rounded-md py-3 px-5 box-border"
      >
        <div
          className={`rounded-md overflow-hidden border-2 h-full flex flex-col min-h-[300px] ${
            editorInFocus && "border-1 border-foreground/15"
          }`}
          onFocus={() => setEditorInFocus(true)}
          onBlur={() => setEditorInFocus(false)}
        >
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage={language}
              defaultValue="//Example Code"
              value={code}
              onChange={(event) => setCode(event ?? "")}
              theme={editorTheme}
              loading={<Spinner variant="ring" />}
              options={{
                formatOnType: true,
                cursorBlinking: "expand",
                codeLens: false,
                padding: {
                  bottom: 10,
                  top: 20,
                },
                snippetSuggestions: "none",
                smoothScrolling: true,
                wordBasedSuggestions: "off",
                quickSuggestions: false, // Disable quick suggestions
                suggestOnTriggerCharacters: false, // Disable suggestions on trigger characters
                acceptSuggestionOnEnter: "off", // Disable accepting suggestions with Enter
                tabCompletion: "off", // Disable tab completion
                inlineSuggest: {
                  enabled: false, // Disable inline suggestions (like GitHub Copilot style)
                },
                showFoldingControls: "always",
                quickSuggestionsDelay: 0,
                parameterHints: {
                  enabled: false, // Disable parameter hints
                },
                hover: {
                  enabled: false, // Disable hover tooltips (optional)
                },
                glyphMargin: false,
              }}
              onMount={(editor, monaco) => {
                // Disable all validation/diagnostics for the language
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                  {
                    noSemanticValidation: true,
                    noSyntaxValidation: true,
                  }
                );

                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                  {
                    noSemanticValidation: true,
                    noSyntaxValidation: true,
                  }
                );
              }}
            />
          </div>
          <div className="w-full h-12 flex-shrink-0 bg-background flex justify-between items-center px-3 gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-[70%]"
                onClick={(event) => event.preventDefault()}
                asChild
              >
                <Button variant="outline">
                  <IoMdSettings />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    setTheme((prev) => (theme === "light" ? "dark" : "light"))
                  }
                >
                  Switch Theme
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
            <ButtonGroup className="h-[70%]">
              <Button disabled={running} variant="outline" className="h-[100%]">
                {submitting ? "Running" : "Run"}
              </Button>
              <Button
                disabled={submitting}
                variant="default"
                className="h-[100%]"
              >
                {submitting ? "Submitting" : "Submit"}
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodingBlock;
