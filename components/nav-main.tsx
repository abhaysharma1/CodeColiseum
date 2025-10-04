"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { MdLibraryBooks, MdOutlineSpaceDashboard } from "react-icons/md";
import { PiStudentBold } from "react-icons/pi";

export function NavMain({ page }: { page: string }) {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarMenu>
          <SidebarMenuItem
            className={
              page == "DASHBOARD"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.replace("/dashboard/teacher")}
          >
            <SidebarMenuButton tooltip={"Dashboard"}>
              <MdOutlineSpaceDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "STUDENTS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.replace("/dashboard/teacher/students")}
          >
            <SidebarMenuButton tooltip={"Students"}>
              <PiStudentBold />
              <span>Students</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={
              page == "PROBLEMS"
                ? "bg-primary text-primary-foreground rounded-md"
                : ""
            }
            onClick={() => router.replace("/dashboard/teacher/problems")}
          >
            <SidebarMenuButton tooltip={"Problems"}>
              <MdLibraryBooks />
              <span>Problems</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
