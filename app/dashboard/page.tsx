'use client'
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";
import React from "react";


function Dashboard() {

  const {user} = useAuth()
  const router = useRouter();


  if(user?.role == "TEACHER"){
    router.replace("/dashboard/teacher")
  }



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
