"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import InfiniteScroll from "react-infinite-scroll-component";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

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
    setSelectedProblemsId((prev = []) => {
      const set = new Set(prev);
      if (set.has(problemId)) {
        set.delete(problemId);
      } else {
        set.add(problemId);
      }
      console.log(set);
      return Array.from(set);
    });
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          type="text"
          placeholder="Search problems by title or tags..."
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <InfiniteScroll
          dataLength={problemData.length}
          next={fetchProblems}
          hasMore={hasMore}
          loader={<></>}
          height={450}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Select</TableHead>
                <TableHead className="w-20">No.</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-28">Difficulty</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problemData.length === 0 && !loadingProblems ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Search className="h-8 w-8 mb-2" />
                      <p>No problems found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                problemData.map((problem) => (
                  <TableRow
                    key={problem.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => addToSelectedProblem(problem.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedProblemsId?.includes(problem.id)}
                        onCheckedChange={() => addToSelectedProblem(problem.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {problem.number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {problem.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(getDifficultyColor(problem.difficulty))}
                      >
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.slice(0, 3).map((item) => (
                          <Badge
                            key={item.tag.name}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchValue(item.tag.name);
                              setPage(1);
                            }}
                          >
                            {item.tag.name.charAt(0).toUpperCase() +
                              item.tag.name.slice(1).toLowerCase()}
                          </Badge>
                        ))}
                        {problem.tags && problem.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{problem.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/problems?id=${problem.id}`}
                          target="_blank"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {loadingProblems && (
            <div className="flex justify-center items-center py-8">
              <Spinner variant="infinite" />
            </div>
          )}
        </InfiniteScroll>
      </div>

      {selectedProblemsId && selectedProblemsId.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{selectedProblemsId.length}</Badge>
          <span>
            {selectedProblemsId.length === 1
              ? "problem selected"
              : "problems selected"}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProblemsTestTable;
