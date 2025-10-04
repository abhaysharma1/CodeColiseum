'use client'
import { SiteHeader } from "@/components/site-header";
import React from "react";


function Dashboard() {

  return (
    <>

      <SiteHeader name={"DASHBOARD"} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-10 h-[100%] md:gap-6 md:py-6">
            <div>Dashboard</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
