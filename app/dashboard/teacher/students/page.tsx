"use client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useState } from "react";
import { UploadIcon } from "lucide-react";
import CreateGroupBox from "./createGroupBox";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import axios from "axios";
import CreatedGroups from "./createdGroups";
import { Separator } from "@/components/ui/separator";

interface newgroupdataprops {
  groupName: string;
  description: string;
  emails: string[];
}

function Students() {
  const [files, setFiles] = useState<File[] | undefined>();
  const [textEmailField, setTextEmailField] = useState<string | undefined>( // Value from email text field
    undefined
  );
  const [textDisabled, setTextDisabled] = useState(false);
  const [fileUploadDisabled, setFileUploadDisabled] = useState(false);

  const [textEmails, setTextEmail] = useState<string[]>([]); // Emails in array form

  const [showCreateGroupBox, setShowCreateGroupBox] = useState(false);

  const [loading, setLoading] = useState(false);

  const [newGroupData, setNewGroupData] = useState<newgroupdataprops>({
    groupName: "",
    description: "",
    emails: [] as string[],
  });

  useEffect(() => {
    if (files) {
      setTextDisabled(true);
    } else {
      setTextDisabled(false);
    }
    if (textEmailField) {
      setFileUploadDisabled(true);
    } else {
      setFileUploadDisabled(false);
    }
  }, [files, textEmailField]);

  const handleDrop = (files: File[]) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setFiles([file]);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;

      // Split by newlines or commas
      const emails = text
        .split(/[\n,]/) // split on newline or comma
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      setTextEmail(emails);
    };

    reader.readAsText(file);
  };

  const makeCreateGroupVisible = (event: FormData) => {
    if (textEmailField) {
      setNewGroupData((prev) => ({
        ...prev,
        emails: textEmailField?.split(",") ?? [],
      }));
    } else if (textEmails) {
      setNewGroupData((prev) => ({
        ...prev,
        emails: textEmails,
      }));
    } else {
      toast.error("Please Enter Emails or upload File");
      return;
    }
    setShowCreateGroupBox(true);
  };

  const checkEmpty = () => {
    if (!newGroupData.groupName) {
      toast.error("Please Enter Group Name");
      return false;
    }
    if (!newGroupData.description) {
      toast.error("Please Enter Group Description");
      return false;
    }
    if (!newGroupData.emails) {
      toast.error("Please Provide Emails");
      return false;
    }
    return true;
  };

  const createNewGroup = async () => {
    if (!checkEmpty()) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/teacher/creategroup",
        newGroupData
      );
      if (response.status == 200) {
        toast.success(response.statusText);
        const { data } = response;
        console.log(data);
        return;
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-left animate-once h-full w-full flex flex-col">
      <div className="w-full">
        <SiteHeader name={"Manage Students"} />
      </div>
      <div
        className="flex-1 
      "
      >
        <div className="@container/main flex flex-1 gap-2 ">
          <div className="flex flex-col gap-4 py-4 px-10 h-full w-full md:gap-6 md:py-6 box-border">
            {showCreateGroupBox && (
              <CreateGroupBox
                setShowCreateGroupBox={setShowCreateGroupBox}
                setNewGroupData={setNewGroupData}
                loading={loading}
                createNewGroup={createNewGroup}
              />
            )}
            <div>
              <div>
                <Label className="text-2xl">Create Group Of Students</Label>
                <form action={makeCreateGroupVisible} className="w-[65vw]">
                  <div className="flex gap-5 mt-4">
                    <Textarea
                      disabled={textDisabled}
                      className="min-w-[30vw]"
                      placeholder="Enter Students emails separated with a comma"
                      value={textEmailField}
                      onChange={(event) =>
                        setTextEmailField(event.target.value)
                      }
                    />
                    {/* File Upload zone */}
                    <Dropzone
                      disabled={fileUploadDisabled}
                      className="h-[110px] w-[20rem]"
                      accept={{
                        "text/csv": [],
                        "application/vnd.ms-excel": [],
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
                                  Upload a CSV file{" "}
                                </p>
                                <p className="font-medium text-sm">
                                  containing students emails
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
                  </div>
                  <div className="w-[100%] justify-end flex mt-4">
                    <Button type="submit">Create Group</Button>
                  </div>
                </form>
              </div>
              <Separator className="mt-4" />
              <div>
                <CreatedGroups />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Students;
