import React from "react";
import ProblemsTable from "./problemsTable";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar";

function page() {
  return (
    <div className="h-full w-full">
      <Navbar01 />
      <div className=" p-10">
        <ProblemsTable />
      </div>
    </div>
  );
}

export default page;
