"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import data from "./data.json";
import { ProtectedRoute } from "@/components/protectedroute";
import { useAuth } from "@/context/authcontext";
import { useState } from "react";
import TeacherLayout from "@/components/dashboards/teacher/teacherLayout";

export default function Page() {
  const { user } = useAuth();
  const [page, setPage] = useState("Dashboard");

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        {user?.role == "TEACHER" ? <TeacherLayout page={page} /> : ""}
      </SidebarProvider>
    </ProtectedRoute>
  );
}
