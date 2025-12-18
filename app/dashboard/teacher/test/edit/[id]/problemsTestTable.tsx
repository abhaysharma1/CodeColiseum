"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { IoMdSearch } from "react-icons/io";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import InfiniteScroll from "react-infinite-scroll-component";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { ExamProblem } from "./page";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";

export interface ProblemTag {
  tag: {
    name: string;
  };
}

export interface problemData {
  id: string;
  number: number;
  title: string;
  description: string;
  difficulty: string;
  tags: ProblemTag[];
}

function ProblemsTestTable({
  selectedProblemsId,
  setSelectedProblemsId,
}: {
  selectedProblemsId: string[] | undefined;
  setSelectedProblemsId: Dispatch<SetStateAction<string[] | undefined>>;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [problemData, setProblemData] = useState<problemData[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const addToSelectedProblem = (problemId: string) => {
    const alreadyExists = selectedProblemsId?.find((item) => item == problemId);
    if (alreadyExists) {
      setSelectedProblemsId((prev) =>
        prev?.filter((item) => item != problemId)
      );
    } else {
      setSelectedProblemsId((prev) =>
        prev ? [...prev, problemId] : [problemId]
      );
    }
  };

  const fetchProblems = async (reset = false) => {
    setLoadingProblems(true);

    const response = await axios.post(
      `/api/problems/getproblems?page=${page}&limit=20`,
      { searchValue }
    );

    const data: problemData[] = response.data as problemData[];

    if (data.length < 20) {
      setHasMore(false);
    } else {
      setHasMore(true);
      setPage((prev) => prev + 1);
    }

    setProblemData((prev) => (reset ? data : [...prev, ...data]));

    setLoadingProblems(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProblems(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  return (
    <InfiniteScroll
      dataLength={problemData.length} //This is important field to render the next data
      next={fetchProblems}
      hasMore={hasMore}
      loader={<></>}
    >
      <div className="h-[400px]">
        <div className="relative w-40 mb-2 m-1">
          <IoMdSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            type="text"
            placeholder="Search"
            className={cn(
              "h-7 w-[13rem] rounded-md border bg-transparent pl-8 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
              "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            )}
          />
        </div>

        <Table>
          <TableCaption>
            Hmmmmm&apos; Couldn&apos;t think of anything catchy.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-left">Difficulty</TableHead>
              <TableHead className="text-left">Tags</TableHead>
              <TableHead className="text-left">See Problem</TableHead>
              <TableHead className="text-left">Selected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problemData?.map((problem, index) => (
              <TableRow
                key={index}
                className="cursor-pointer animate-fade animate-once"
                onClick={() => addToSelectedProblem(problem.id)}
              >
                <TableCell className="font-medium">{problem.number}</TableCell>
                <TableCell>{problem.title}</TableCell>
                <TableCell className="text-left">
                  {problem.difficulty}
                </TableCell>
                <TableCell className="text-left">
                  {problem?.tags?.map((item) => (
                    <Button
                      key={item.tag.name}
                      variant="ghost"
                      className="h-5 p-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSearchValue(item.tag.name);
                        setPage(1);
                      }}
                    >
                      {item.tag.name.charAt(0).toUpperCase() +
                        item.tag.name.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </TableCell>
                <TableCell>
                  <Button
                    variant={"link"}
                    className="h-5 p-2 "
                    asChild
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Link
                      href={`/problems?id=${problem.id}`}
                      className="h-5"
                      target="_blank"
                    >
                      Open
                      <FaExternalLinkAlt className="opacity-70 size-3" />
                    </Link>
                  </Button>
                </TableCell>

                <TableCell>
                  <Checkbox
                    checked={
                      selectedProblemsId?.find((item) => item == problem.id)
                        ? true
                        : false
                    }
                    className="cursor-pointer"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            {loadingProblems && (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex justify-center items-center h-40 w-full">
                    <Spinner variant="infinite" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableFooter>
        </Table>
      </div>
    </InfiniteScroll>
  );
}

export default ProblemsTestTable;
