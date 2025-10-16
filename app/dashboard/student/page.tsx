"use client";
import { SiteHeader } from "@/components/site-header";

export default function StudentDashboard() {
  return (
    <>
      <SiteHeader name="DASHBOARD" />
      <div className="flex flex-1 flex-col p-10">
        <h1 className="text-2xl">Student Dashboard</h1>
      </div>
    </>
  );
}
