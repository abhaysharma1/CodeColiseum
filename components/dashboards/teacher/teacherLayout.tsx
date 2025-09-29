"use client";
import { useAuth } from "@/context/authcontext";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { columns } from "./columns";
import  DataTable  from "@/components/dashboards/teacher/datatable";

export default function TeacherLayout({ page }: { page: string }) {

  const data = [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
  ];
  const { user } = useAuth();

  return (
    <>
      <AppSidebar user={user} variant="inset" page={page} />
      <SidebarInset>
        <SiteHeader name="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
              {/* <SectionCards /> */}
              {/* <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div> */}

              {/* table here*/}
              <DataTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
