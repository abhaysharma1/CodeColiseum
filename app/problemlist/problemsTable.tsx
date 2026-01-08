"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IoMdSearch } from "react-icons/io";
import axios from "axios";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import InfiniteScroll from "react-infinite-scroll-component";
import { useRouter } from "next/navigation";

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

function ProblemsTable() {
  const [searchValue, setSearchValue] = useState("");
  const [problemData, setProblemData] = useState<problemData[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();

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

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "default";
      case "medium":
        return "secondary";
      case "hard":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-semibold">All Problems</CardTitle>
          <div className="relative w-full sm:w-80">
            <IoMdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              type="text"
              placeholder="Search problems by title or tag..."
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <InfiniteScroll
          dataLength={problemData.length}
          next={fetchProblems}
          hasMore={hasMore}
          loader={<></>}
        >
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[120px] text-center">Difficulty</TableHead>
                  <TableHead className="w-[300px]">Tags</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingProblems && problemData.length === 0 ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full max-w-xs" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : problemData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-muted-foreground">No problems found</p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  problemData?.map((problem) => (
                    <TableRow
                      key={problem.id}
                      className="group cursor-pointer hover:bg-muted/50 transition-all duration-200 active:bg-muted"
                      onClick={() => router.push(`/problems?id=${problem.id}`)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          router.push(`/problems?id=${problem.id}`);
                        }
                      }}
                    >
                      <TableCell className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {problem.number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {problem.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getDifficultyVariant(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {problem?.tags?.map((item) => (
                            <Badge
                              key={item.tag.name}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSearchValue(item.tag.name);
                                setPage(1);
                              }}
                            >
                              {item.tag.name.charAt(0).toUpperCase() +
                                item.tag.name.slice(1).toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {loadingProblems && problemData.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <Spinner variant="infinite" />
            </div>
          )}

          {!hasMore && problemData.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              You&apos;ve reached the end of the list
            </p>
          )}
        </InfiniteScroll>
      </CardContent>
    </Card>
  );
}


export default ProblemsTable;
