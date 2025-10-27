"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

const data: incomingData[] = [
  {
    id: "exam_001",
    title: "Data Structures Midterm",
    description: "Covers stacks, queues, linked lists, and trees.",
    timeLimit: 90,
    creatorId: "teacher_123",
    startingDate: "2025-10-05T09:00:00.000Z",
    endDate: "2025-10-05T11:00:00.000Z",
    status: "upcoming",
    candidates: ["student_001", "student_002"],
    participants: ["student_001", "student_002", "student_003", "student_004"],
  },
  {
    id: "exam_002",
    title: "Algorithms Final",
    description: "Sorting, searching, dynamic programming, and graphs.",
    timeLimit: 120,
    creatorId: "teacher_456",
    startingDate: "2025-12-15T13:00:00.000Z",
    endDate: "2025-12-15T16:00:00.000Z",
    status: "upcoming",
    candidates: ["student_005"],
    participants: ["student_005", "student_006", "student_007"],
  },
  {
    id: "exam_003",
    title: "Operating Systems Quiz",
    description: "Memory management, processes, threads, and file systems.",
    timeLimit: 45,
    creatorId: "teacher_789",
    startingDate: "2025-09-15T10:30:00.000Z",
    endDate: "2025-09-15T11:15:00.000Z",
    status: "ended",
    candidates: ["student_008", "student_009"],
    participants: ["student_008", "student_009", "student_010"],
  },
  {
    id: "exam_004",
    title: "Database Systems Assignment",
    description: "ER diagrams, SQL queries, normalization, and transactions.",
    timeLimit: 60,
    creatorId: "teacher_234",
    startingDate: "2025-10-12T08:00:00.000Z",
    endDate: "2025-10-12T09:00:00.000Z",
    status: "upcoming",
    candidates: [],
    participants: ["student_011", "student_012"],
  },
  {
    id: "exam_005",
    title: "Computer Networks Test",
    description: "OSI model, TCP/IP, routing algorithms, and protocols.",
    timeLimit: 75,
    creatorId: "teacher_345",
    startingDate: "2025-08-01T14:00:00.000Z",
    endDate: "2025-08-01T15:15:00.000Z",
    status: "ended",
    candidates: ["student_013", "student_014", "student_015"],
    participants: ["student_013", "student_014", "student_015", "student_016"],
  },
  {
    id: "exam_006",
    title: "Software Engineering Project Review",
    description:
      "Covers agile methodology, UML diagrams, and testing strategies.",
    timeLimit: 90,
    creatorId: "teacher_567",
    startingDate: "2025-10-25T10:00:00.000Z",
    endDate: "2025-10-25T11:30:00.000Z",
    status: "upcoming",
    candidates: [],
    participants: ["student_017", "student_018", "student_019"],
  },
  {
    id: "exam_007",
    title: "Artificial Intelligence Quiz",
    description:
      "Machine learning basics, search algorithms, and neural networks.",
    timeLimit: 60,
    creatorId: "teacher_678",
    startingDate: "2025-07-05T09:30:00.000Z",
    endDate: "2025-07-05T10:30:00.000Z",
    status: "ended",
    candidates: ["student_020", "student_021"],
    participants: ["student_020", "student_021", "student_022"],
  },
];

export interface incomingData {
  id: string; // unique exam ID
  title: string; // exam title
  description: string; // exam description
  timeLimit: number; // in minutes
  creatorId: string; // teacher ID who created the exam
  startingDate: string; // ISO 8601 string
  endDate: string; // ISO 8601 string
  status: "upcoming" | "ended"; // exam status
  candidates: string[]; // array of student IDs who have taken the exam
  participants: string[];
}

const columns: ColumnDef<incomingData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("endDate");
      const formattedDate = new Date(date as string);

      return (
        <div className="">
          {formattedDate.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "startingDate",
    header: () => <div className="text-left">Starting Date</div>,
    cell: ({ row }) => {
      const date = row.getValue("startingDate");
      const formattedDate = new Date(date as string);

      return (
        <div className="text-left font-medium">
          {formattedDate.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => <div className="text-left">Description</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium w-[15vw] truncate">
          {row.getValue("description")}
        </div>
      );
    },
  },
  {
    id: "candidates",
    header: () => <div className="text-left">Candidates/Enrolled</div>,
    accessorFn: (row) => row.candidates, // optional, for filtering/sorting
    cell: ({ row }) => {
      const candi: string[] = row.original.candidates ?? [];
      const parti: string[] = row.original.participants ?? [];
      return (
        <div className="text-center font-medium">
          {candi.length}/{parti.length}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const router = useRouter();

  return (
    <div className="w-full h-full animate-fade-left animate-once">
      <SiteHeader name={"Dashboard"} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <Label className="text-3xl">Examinations</Label>
            <div className="flex items-center py-4 justify-between">
              <Input
                placeholder="Filter tests..."
                value={
                  (table.getColumn("title")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />

              <div className="">
                <Button
                  className="mr-4"
                  variant="default"
                  onClick={() => router.replace("/dashboard/teacher/createtest")}
                >
                  Create Test
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
