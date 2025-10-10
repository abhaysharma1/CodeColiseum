"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/authcontext";
import { Switch } from "./ui/switch";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { MdDarkMode } from "react-icons/md";
import { FaSun } from "react-icons/fa";

export function NavUser({}: {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}) {
  const { isMobile } = useSidebar();

  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const logoutcust = () => {
    toast.loading("Logging Out");
    logout();
    toast.dismiss();
    toast.success("Logged Out Successfully");
  };

  const changeTheme = () => {
    setTheme(theme == "dark" ? "light" : "dark");
  };

  useEffect(() => {
    toast.success(
      `Theme toggled to ${theme?.charAt(0).toUpperCase()}${theme
        ?.slice(1)
        .toLowerCase()}`
    );
  }, [theme]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.image as string} alt={user?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.image as string} alt={user?.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    changeTheme();
                  }}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {theme === "dark" ? (
                      <MdDarkMode className="mt-0.5 mr-1 animate-spin animate-once animate-duration-[200ms]" />
                    ) : (
                      <FaSun className="mt-0.5 mr-1 animate-spin animate-once animate-duration-[200ms]" />
                    )}
                    <span>Switch Theme</span>
                  </div>
                  <Switch checked={theme === "light"} />
                </button>
              </DropdownMenuItem>

              {/* <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logoutcust}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
