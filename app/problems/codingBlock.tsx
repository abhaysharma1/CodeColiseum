"use client";
import React, { useEffect, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Button } from "@/components/ui/button";
import { IoMdSettings } from "react-icons/io";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";
import { getLanguageId } from "@/utils/getLanguageId";

interface sentCode {
  questionId: string;
  languageId: number;
  code: string;
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

const availableLanguages = [
  {
    id: 50,
    name: "C",
    monacoLang: "c",
  },
  {
    id: 54,
    name: "C++",
    monacoLang: "cpp",
  },
  {
    id: 51,
    name: "C#",
    monacoLang: "csharp",
  },
  {
    id: 60,
    name: "Go",
    monacoLang: "go",
  },
  {
    id: 62,
    name: "Java",
    monacoLang: "java",
  },
  {
    id: 63,
    name: "JavaScript",
    monacoLang: "javascript",
  },
  {
    id: 71,
    name: "Python",
    monacoLang: "python",
  },
  {
    id: 73,
    name: "Rust",
    monacoLang: "rust",
  },
  {
    id: 74,
    name: "TypeScript",
    monacoLang: "typescript",
  },
];

// Theme names must match exactly with the JSON files in monaco-themes
const themeFileMap: Record<string, string> = {
  Active4D: "Active4D",
  "All Hallows Eve": "All Hallows Eve",
  Amy: "Amy",
  "Birds of Paradise": "Birds of Paradise",
  Blackboard: "Blackboard",
  "Brilliance Black": "Brilliance Black",
  "Brilliance Dull": "Brilliance Dull",
  "Chrome DevTools": "Chrome DevTools",
  "Clouds Midnight": "Clouds Midnight",
  Clouds: "Clouds",
  Cobalt: "Cobalt",
  Dawn: "Dawn",
  Dracula: "Dracula",
  Dreamweaver: "Dreamweaver",
  Eiffel: "Eiffel",
  "Espresso Libre": "Espresso Libre",
  GitHub: "GitHub",
  IDLE: "IDLE",
  Katzenmilch: "Katzenmilch",
  "Kuroir Theme": "Kuroir Theme",
  LAZY: "LAZY",
  "MagicWB (Amiga)": "MagicWB (Amiga)",
  "Merbivore Soft": "Merbivore Soft",
  Merbivore: "Merbivore",
  "Monokai Bright": "Monokai Bright",
  Monokai: "Monokai",
  "Night Owl": "Night Owl",
  Nord: "Nord",
  "Oceanic Next": "Oceanic Next",
  "Pastels on Dark": "Pastels on Dark",
  "Slush and Poppies": "Slush and Poppies",
  "Solarized-dark": "Solarized-dark",
  "Solarized-light": "Solarized-light",
  SpaceCadet: "SpaceCadet",
  Sunburst: "Sunburst",
  "Tomorrow-Night-Blue": "Tomorrow-Night-Blue",
  "Tomorrow-Night-Bright": "Tomorrow-Night-Bright",
  "Tomorrow-Night-Eighties": "Tomorrow-Night-Eighties",
  "Tomorrow-Night": "Tomorrow-Night",
  Tomorrow: "Tomorrow",
  Twilight: "Twilight",
  "Upstream Sunburst": "Upstream Sunburst",
  "Vibrant Ink": "Vibrant Ink",
};

const availableThemes = Object.keys(themeFileMap);

function CodingBlock({
  questionId,
  setRunTestCaseResuts,
}: {
  questionId: string;
  setRunTestCaseResuts: React.Dispatch<
    React.SetStateAction<runTestCaseType | undefined>
  >;
}) {
  const [editorTheme, setEditorTheme] = useState("Sunburst");
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState("cpp");
  const [editorInFocus, setEditorInFocus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [themeList, setThemeList] = useState<string[]>();
  const [monacoInstance, setMonacoInstance] = useState<any>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setThemeList(availableThemes);
  }, []);

  useEffect(() => {
    const loadTheme = async (themeName: string) => {
      if (!monacoInstance || themeName === "vs-dark") {
        return;
      }

      try {
        const fileName = themeFileMap[themeName];
        if (!fileName) {
          throw new Error(`Theme "${themeName}" not found in theme mapping`);
        }

        const themeData = await import(`monaco-themes/themes/${fileName}.json`);
        const safeThemeName = themeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        monacoInstance.editor.defineTheme(safeThemeName, themeData);
        monacoInstance.editor.setTheme(safeThemeName);
      } catch (error) {
        console.error(`Failed to load theme "${themeName}"`, error);
        toast.error(`Failed to load theme "${themeName}"`);
        monacoInstance.editor.setTheme("vs-dark");
        setEditorTheme("vs-dark");
      }
    };

    loadTheme(editorTheme);
  }, [editorTheme, monacoInstance]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  };

  const onRun = async () => {
    setRunning(true);
    if ((code && code?.length < 1) || code == "//Example Code") {
      toast.error("Please Type Something");
      setRunning(false);
      return;
    }

    const languageId = getLanguageId(language) ?? 54; // C++ as Fallback

    const sentData: sentCode = {
      questionId: questionId,
      languageId: languageId,
      code: code,
    };

    try {
      const response = await axios.post("/api/problems/runcode", sentData);
      setRunTestCaseResuts(response.data as runTestCaseType);
      if (response.status > 400) {
        toast.error("Couldn't run you code");
        toast.error(response.statusText);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div
        title="tab navbar"
        className="w-[calc(60vw-2.5rem)] h-[calc(100vh-6.5rem)] outline-1 m-5 outline-offset-8 rounded-md py-3 px-5"
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
              language={language}
              defaultValue="//Example Code"
              value={code}
              onChange={(event) => setCode(event ?? "")}
              theme={editorTheme}
              loading={<Spinner variant="ring" />}
              beforeMount={setMonacoInstance}
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
                quickSuggestions: false,
                suggestOnTriggerCharacters: false,
                acceptSuggestionOnEnter: "off",
                tabCompletion: "off",
                inlineSuggest: {
                  enabled: false,
                },
                showFoldingControls: "always",
                quickSuggestionsDelay: 0,
                parameterHints: {
                  enabled: false,
                },
                hover: {
                  enabled: false,
                },
                glyphMargin: false,
              }}
              onMount={handleEditorDidMount}
            />
          </div>
          <div className="w-full h-12 flex-shrink-0 bg-background flex justify-between items-center px-3 gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-[70%]" asChild>
                <Button variant="outline">
                  <IoMdSettings />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="">
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  Switch Website Theme
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <div className="flex justify-between w-full mr-2">
                      <span>Editor Theme</span>
                      <span className="ml-2 text-muted-foreground">
                        {editorTheme}
                      </span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto">
                    {themeList?.map((item) => (
                      <DropdownMenuItem
                        key={item}
                        onClick={() => setEditorTheme(item)}
                      >
                        {item
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <div className="flex justify-between w-full mr-2">
                      <span>Language</span>
                      <span className="ml-2 text-muted-foreground">
                        {
                          availableLanguages.find(
                            (lang) => lang.monacoLang === language
                          )?.name
                        }
                      </span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {availableLanguages.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => setLanguage(item.monacoLang)}
                      >
                        {item.name.at(0)?.toUpperCase() +
                          item.name.slice(1).toLowerCase()}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
            <ButtonGroup className="h-[70%]">
              <Button
                disabled={running}
                variant="outline"
                className="h-[100%]"
                onClick={() => onRun()}
              >
                {running ? "Running" : "Run"}
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
