"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { IoCodeSlashOutline } from "react-icons/io5";
import { AiOutlineTrophy } from "react-icons/ai";

export function NavStudentMain({ page }: { page: string }) {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem
            className={
              page == "DASHBOARD"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.replace("/dashboard/student")}
          >
            <SidebarMenuButton tooltip={"Dashboard"}>
              <MdOutlineSpaceDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "PROBLEMS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.replace("/dashboard/student/problems")}
          >
            <SidebarMenuButton tooltip={"Problems"}>
              <IoCodeSlashOutline />
              <span>Problems</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "CONTESTS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.replace("/dashboard/student/contests")}
          >
            <SidebarMenuButton tooltip={"Contests"}>
              <AiOutlineTrophy />
              <span>Contests</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "PROGRESS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.replace("/dashboard/student/progress")}
          >
            <SidebarMenuButton tooltip={"Progress"}>
              <MdOutlineSpaceDashboard />
              <span>Progress</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
