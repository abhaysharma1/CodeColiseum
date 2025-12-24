"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { MdFormatAlignLeft } from "react-icons/md";
import {
  runTestCaseType,
  submitTestCaseType,
} from "@/app/test/givetest/[id]/interface";

interface sentCode {
  questionId: string;
  languageId: number;
  code: string;
}

const availableLanguages = [
  { id: 50, name: "C", monacoLang: "c" },
  { id: 54, name: "C++", monacoLang: "cpp" },
  { id: 51, name: "C#", monacoLang: "csharp" },
  { id: 60, name: "Go", monacoLang: "go" },
  { id: 62, name: "Java", monacoLang: "java" },
  { id: 63, name: "JavaScript", monacoLang: "javascript" },
  { id: 71, name: "Python", monacoLang: "python" },
  { id: 73, name: "Rust", monacoLang: "rust" },
  { id: 74, name: "TypeScript", monacoLang: "typescript" },
];

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

interface CodingBlockProps {
  code: string;
  running: boolean;
  submitting: boolean;
  language: string;
  setCode: Dispatch<SetStateAction<string>>;
  setLanguage: Dispatch<SetStateAction<string>>;
  onRun: () => Promise<void>;
  onSubmit: () => Promise<void>;
}

function CodingEditor({
  code,
  setCode,
  running,
  submitting,
  language,
  setLanguage,
  onRun,
  onSubmit,
}: CodingBlockProps) {
  const [editorTheme, setEditorTheme] = useState("Sunburst");
  const [editorInFocus, setEditorInFocus] = useState(false);
  const [themeList, setThemeList] = useState<string[]>();
  const [monacoInstance, setMonacoInstance] = useState<any>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

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

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);

    // Add keyboard shortcut for formatting (Shift+Alt+F)
    editor.addAction({
      id: "format-code",
      label: "Format Document",
      keybindings: [
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      ],
      run: function (ed) {
        ed.getAction("editor.action.formatDocument")?.run();
      },
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  };

  return (
    <div className="flex-1">
      <div
        title="tab navbar"
        className="flex-1 h-[calc(100vh-7rem)] outline-1 m-5 outline-offset-8 rounded-md py-3 px-5"
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
              options={{
                formatOnType: true,
                formatOnPaste: true,
                cursorBlinking: "expand",
                codeLens: false,
                padding: { bottom: 10, top: 20 },
                snippetSuggestions: "none",
                smoothScrolling: true,
                wordBasedSuggestions: "off",
                quickSuggestions: false,
                suggestOnTriggerCharacters: false,
                acceptSuggestionOnEnter: "off",
                tabCompletion: "off",
                inlineSuggest: { enabled: false },
                showFoldingControls: "always",
                quickSuggestionsDelay: 0,
                parameterHints: { enabled: false },
                hover: { enabled: false },
                glyphMargin: false,
              }}
              onMount={handleEditorDidMount}
            />
          </div>

          <div className="w-full h-12 flex-shrink-0 bg-background flex justify-between items-center px-3 gap-3">
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger className="h-[70%]" asChild>
                  <Button variant="outline">
                    <IoMdSettings />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
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
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
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
                              (l) => l.monacoLang === language
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
                          {item.name.charAt(0).toUpperCase() +
                            item.name.slice(1).toLowerCase()}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              {(language === "javascript" || language === "typescript") && (
                <Button
                  className="ml-2 h-[70%] animate-fade-right animate-once"
                  onClick={() => {
                    if (editorInstance) {
                      try {
                        editorInstance
                          .getAction("editor.action.formatDocument")
                          ?.run();
                      } catch (error) {
                        console.error("Format error:", error);
                        toast.error("Failed to format code");
                      }
                    } else {
                      toast.error("Editor not ready");
                    }
                  }}
                  variant="outline"
                  title="Format Code (Shift+Alt+F)"
                >
                  <MdFormatAlignLeft />
                </Button>
              )}
            </div>

            <ButtonGroup className="h-[70%]">
              <Button
                disabled={running}
                variant="outline"
                className="h-[100%]"
                onClick={onRun}
              >
                {running ? "Running" : "Run"}
              </Button>

              <Button
                disabled={submitting}
                variant="default"
                className="h-[100%]"
                onClick={onSubmit}
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

export default CodingEditor;
