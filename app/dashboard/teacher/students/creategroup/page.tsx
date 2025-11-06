"use client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Textarea } from "@/components/ui/textarea";
import { UploadIcon } from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import CreateCompletion from "./createCompletion";

interface newgroupdataprops {
  groupName: string;
  description: string;
  emails: string[];
  allowJoinByLink: boolean;
}

interface CreateGroupResponse {
  notFoundMembers: string[];
  notStudents: string[];
  alreadyMembers: string[];
  addedCount: number;
}
interface ApiResponse {
  status: number;
  statusText: string;
  data: CreateGroupResponse;
}

function CreateGroup() {
  const [groupCreatedBoxVisible, setGroupCreatedBoxVisible] = useState(false);

  const [fileUploadDisabled, setFileUploadDisabled] = useState(false);
  const [textDisabled, setTextDisabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[] | undefined>();
  const [textEmailField, setTextEmailField] = useState<string | undefined>( // Value from email text field
    undefined
  );

  const [response, setResponse] = useState<ApiResponse>();

  const [newGroupData, setNewGroupData] = useState<newgroupdataprops>({
    groupName: "",
    description: "",
    emails: [] as string[],
    allowJoinByLink: true,
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

  useEffect(() => {
    if (textEmailField) {
      const emails = textEmailField.split(",");
      setNewGroupData((prev) => ({ ...prev, emails: emails }));
    }
  }, [textEmailField]);

  const checkEmpty = () => {
    if (!newGroupData.groupName) {
      toast.error("Please Enter Group Name");
      return false;
    }
    if (!newGroupData.description) {
      toast.error("Please Enter Group Description");
      return false;
    }
    if (!newGroupData.emails || newGroupData.emails.length === 0) {
      toast.error("Please Provide Emails");
      return false;
    }
    return true;
  };

  const createNewGroup = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setResponse(response as ApiResponse);
        toast.success(response.statusText);
        const { data } = response;
        console.log(data);
        return;
      } else {
        toast.error(response.data as string);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

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

      setNewGroupData((prev) => ({ ...prev, emails: emails }));
    };

    reader.readAsText(file);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    event.preventDefault();
    const { name, value } = event.target;
    setNewGroupData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      {groupCreatedBoxVisible && (
        <div className="w-full h-full bg-background/50 z-50 absolute flex justify-center items-center">
          <div>
            <CreateCompletion creatingGroup={loading} data={response} />
          </div>
        </div>
      )}
      <div className="w-full">
        <SiteHeader name={"Create a Group"} />
      </div>
      <form className="w-[65vw]" onSubmit={createNewGroup}>
        <div className="p-8">
          <Label className="text-md">Enter Group Name</Label>
          <Input
            className="w-70 mt-3"
            placeholder="Enter Name"
            onChange={handleChange}
            name="groupName"
          />
          <div className="flex items-stretch justify-between w-full">
            <div className="w-[50%]">
              <Label className="mt-5 text-md">Enter Group Description</Label>
              <Textarea
                className="mt-3"
                placeholder="Enter Description"
                name="description"
                onChange={handleChange}
              />
            </div>
            <div className="w-[30%] mt-5">
              <Label className="text-md">Enable Group Joining By Link/ID</Label>
              <RadioGroup
                defaultValue="enable"
                className="mt-4"
                onValueChange={(value) =>
                  setNewGroupData((prev) => ({
                    ...prev,
                    allowJoinByLink: value === "enable",
                  }))
                }
              >
                <div className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem
                    value="enable"
                    id="enable"
                    className="cursor-pointer"
                  />
                  <Label htmlFor="enable" className="cursor-pointer">
                    Enable
                  </Label>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem
                    value="disable"
                    id="disable"
                    className="cursor-pointer"
                  />
                  <Label htmlFor="disable" className="cursor-pointer">
                    Disable
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <Label className="mt-4 text-md">Enter Student's Emails</Label>
            <div className="flex gap-5 mt-3">
              <Textarea
                disabled={textDisabled}
                className="min-w-[30vw]"
                placeholder="Enter Students emails separated with a comma"
                value={textEmailField}
                onChange={(event) => setTextEmailField(event.target.value)}
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
              <Button disabled={loading} type="submit">
                {loading ? "Please Wait" : "Create Group"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateGroup;
