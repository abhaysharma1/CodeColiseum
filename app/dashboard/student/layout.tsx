"use client";
import { useAuth } from "@/context/authcontext";
import React, { useEffect, useState } from "react";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const path = usePathname();
  const [page, setPage] = useState("");

  useEffect(() => {
    if (path === "/dashboard/student") {
      setPage("DASHBOARD");
    } else if (path === "/dashboard/student/problems") {
      setPage("PROBLEMS");
    } else if (path === "/dashboard/student/contests") {
      setPage("CONTESTS");
    } else if (path === "/dashboard/student/progress") {
      setPage("PROGRESS");
    }
  }, [path]);

  return (
    <SidebarProvider>
      <StudentSidebar user={user} variant="inset" page={page} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
