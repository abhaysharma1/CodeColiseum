"use client";

import fetchExam from "@/app/actions/teacher/tests/fetchExam";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Textarea } from "@/components/ui/textarea";
import { exam } from "@/interfaces/interface";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { CiEdit } from "react-icons/ci";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AutoCompleteSearchBar from "@/components/fuzzySearchBar";
import fetchAllGroups from "@/app/actions/teacher/group/fetchAllGroups";
import getAllSelectedGroups from "@/app/actions/teacher/tests/getSelectedGroups";
import { Card, CardContent } from "@/components/ui/card";

import { FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import ProblemsTestTable from "./problemsTestTable";
import getSelectedProblems from "@/app/actions/teacher/tests/getSelectedProblems";
import saveDraft from "@/app/actions/teacher/tests/saveDraft";
import publishTest from "@/app/actions/teacher/tests/publishTest";

interface Group {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  noOfMembers: number;
  joinByLink: boolean;
  createdAt: Date;
}

export interface ExamProblem {
  id: string;
  order: number;
  examId: string;
  problemId: string;
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const merged = new Date(date);
  merged.setHours(hours);
  merged.setMinutes(minutes);
  merged.setSeconds(0);
  merged.setMilliseconds(0);

  return merged;
}

function Page() {
  const params = useParams();
  const examId = params.id as string;

  const [groups, setGroups] = useState<Group[] | undefined>();

  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [endDateOpen, setEndDateOpen] = React.useState(false);

  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = React.useState<string | undefined>(
    undefined
  );

  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = React.useState<string | undefined>(undefined);

  const [examDetails, setExamDetails] = useState<exam | undefined>();
  const [selectedGroups, setSelectedGroups] = useState<Group[] | undefined>([]);

  const [selectedProblemsId, setSelectedProblemsId] = useState<
    string[] | undefined
  >();

  const [isLoading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [searchedGroup, setSearchedGroup] = useState<Group | undefined>();

  const [savingDraft, startSavingDraftTransition] = useTransition();
  const [publishingTest, startPublishingTestTransition] = useTransition();

  const changeDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExamDetails((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const deleteGroup = (id: string) => {
    setSelectedGroups((prev) => prev?.filter((grp) => grp.id != id));
  };

  const addGroupToSelected = () => {
    if (!searchedGroup || searchedGroup?.id.length < 2) {
      toast.error("Please Select a Group to add");
      return;
    }
    const finding = selectedGroups?.find((item) => item.id == searchedGroup.id);
    if (finding) {
      toast.error("Group Already Added");
      return;
    }

    setSelectedGroups((prev) => [...(prev || []), searchedGroup]);
  };

  const saveDraftFunc = async () => {
    if (!examDetails || !startDate || !endDate || !startTime || !endTime)
      return;

    if (startDate > endDate) {
      toast.error("Start Date must be < End Date");
      return;
    }

    const combinedStartDateTime = combineDateAndTime(startDate, startTime);
    const combinedEndDateTime = combineDateAndTime(endDate, endTime);

    const updatedExamDetails = {
      ...examDetails,
      startDate: combinedStartDateTime,
      endDate: combinedEndDateTime,
    };

    setExamDetails(updatedExamDetails);

    console.log(updatedExamDetails);

    if (updatedExamDetails && selectedGroups && selectedProblemsId) {
      try {
        await saveDraft({
          updatedExamDetails,
          selectedGroups,
          selectedProblemsId,
        });
        toast.success("Draft saved");
      } catch (error) {
        toast.error("Couldn't save the draft");
      }
    } else {
      toast.error("Please Select Groups, Problems");
    }
  };

  const publishTestFunc = async () => {
    if (!examDetails || !startDate || !endDate || !startTime || !endTime)
      return;

    if (startDate > endDate) {
      toast.error("Start Date must be < End Date");
      return;
    }

    const combinedStartDateTime = combineDateAndTime(startDate, startTime);
    const combinedEndDateTime = combineDateAndTime(endDate, endTime);

    const updatedExamDetails = {
      ...examDetails,
      startDate: combinedStartDateTime,
      endDate: combinedEndDateTime,
    };

    setExamDetails(updatedExamDetails);

    if (updatedExamDetails && selectedGroups && selectedProblemsId) {
      try {
        await publishTest({
          updatedExamDetails,
          selectedGroups,
          selectedProblemsId,
        });
        toast.success("Test Published");
      } catch (error) {
        toast.error("Couldn't publish the test");
      }
    } else {
      toast.error("Please Select Groups, Problems");
    }
  };

  useEffect(() => {
    async function getExamDetails() {
      setLoading(true);
      const data = await fetchExam(examId);
      setExamDetails(data as exam);
      setStartDate(data.startDate);
      const startHours = String(data.startDate.getHours()).padStart(2, "0");
      const startMinutes = String(data.startDate.getMinutes()).padStart(2, "0");
      const startSeconds = String(data.startDate.getSeconds()).padStart(2, "0");
      setStartTime(`${startHours}:${startMinutes}:${startSeconds}`);
      setEndDate(data.endDate);
      const endHours = String(data.endDate.getHours()).padStart(2, "0");
      const endMinutes = String(data.endDate.getMinutes()).padStart(2, "0");
      const endSeconds = String(data.endDate.getSeconds()).padStart(2, "0");
      setEndTime(`${endHours}:${endMinutes}:${endSeconds}`);
      setLoading(false);
    }
    async function getGroups() {
      setLoadingGroups(true);
      const data = await fetchAllGroups();
      setGroups(data);
      setLoadingGroups(false);
    }
    getExamDetails();
    getGroups();
  }, []);

  useEffect(() => {
    async function fetchSelectedGroups() {
      if (examDetails && examDetails.id) {
        const data = await getAllSelectedGroups(examDetails.id);
        setSelectedGroups(data);
      }
    }
    async function fetchSelectedProblems() {
      if (examDetails && examDetails.id) {
        const data = await getSelectedProblems(examDetails.id);
        if (data.length > 0) {
          const onlyIds = data.map((item) => item.id);
          setSelectedProblemsId(onlyIds);
        }
      }
    }
    fetchSelectedProblems();
    fetchSelectedGroups();
  }, [examDetails]);

  return (
    <div>
      <div>
        <SiteHeader name="Edit Test" />
      </div>
      {isLoading || loadingGroups ? (
        <div className="w-full h-full flex justify-center items-center">
          <Spinner variant="infinite" />
        </div>
      ) : (
        <div className="px-8 py-5 gap-5 flex flex-col overflow-y-scroll">
          <div className="flex items-center">
            <Input
              value={examDetails?.title}
              name="title"
              onChange={changeDetails}
              className="w-fit  transition-opacity dark:bg-background  not-focus:border-none mr-2 "
            />
            <CiEdit size={17} />
          </div>
          <div className="gap-4 flex flex-col mt-4">
            <Label>Description</Label>
            <Textarea
              value={examDetails?.description || "Some Description"}
              name="description"
              onChange={(e) =>
                setExamDetails((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
              className="w-90 transition-opacity "
            />
            <div className="flex gap-10">
              <div className="flex flex-col gap-3">
                <Label>Start Date / Time</Label>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-3">
                    <Popover
                      open={startDateOpen}
                      onOpenChange={setStartDateOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date-picker"
                          className="w-32 justify-between font-normal"
                        >
                          {startDate
                            ? startDate.toLocaleDateString()
                            : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={startDate}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            setStartDate(date);
                            setStartDateOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Input
                      type="time"
                      id="time-picker"
                      step="1"
                      value={startTime ?? "10:30:00"}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label>End Date / Time</Label>
                <div className="flex gap-4">
                  <div className="flex flex-col gap-3">
                    <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="end-date-picker"
                          className="w-32 justify-between font-normal"
                        >
                          {endDate
                            ? endDate.toLocaleDateString()
                            : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={endDate}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            setEndDate(date);
                            setEndDateOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Input
                      type="time"
                      id="end-time-picker"
                      step="1"
                      value={endTime ?? "10:30:00"}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pr-17 ">
              <Label className="mb-4">Select Exam Problems</Label>
              <ProblemsTestTable
                selectedProblemsId={selectedProblemsId}
                setSelectedProblemsId={setSelectedProblemsId}
              />
            </div>
            <div className="mt-10">
              <Label>Select Allowed Groups</Label>
              <div className="flex gap-3 items-center">
                {groups && (
                  <AutoCompleteSearchBar
                    groups={groups}
                    setSearchedGroup={setSearchedGroup}
                  />
                )}
                <Button variant={"secondary"} onClick={addGroupToSelected}>
                  Select Group
                </Button>
              </div>
              <div className="mt-2">
                {selectedGroups && selectedGroups?.length > 0 && (
                  <Card className="w-[475px] flex justify-center p-3 ">
                    <CardContent className="flex flex-col gap-2 max-h-[300px] overflow-y-scroll">
                      {selectedGroups?.map((group, index) => (
                        <div key={index} className="">
                          <div className=" bg-background/70 p-4 w-[400px] rounded-md">
                            <div className="w-full flex justify-between">
                              {group.name}
                              <span className="text-foreground/70">
                                <Button onClick={() => deleteGroup(group.id)}>
                                  <FaTrash />
                                </Button>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="w-full flex justify-end mt-4 gap-3">
              <Button
                variant={"secondary"}
                disabled={savingDraft}
                onClick={() =>
                  startSavingDraftTransition(() => saveDraftFunc())
                }
              >
                {savingDraft ? "Saving Draft..." : "Save Draft"}
              </Button>
              <Button
                variant={"default"}
                disabled={publishingTest}
                onClick={() =>
                  startPublishingTestTransition(() => publishTestFunc())
                }
              >
                {publishingTest ? "Wait..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
