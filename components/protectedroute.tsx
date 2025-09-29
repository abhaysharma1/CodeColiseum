"use client";
import { useAuth } from "@/context/authcontext";
import { ReactNode, useEffect } from "react";
import { Spinner } from "./ui/shadcn-io/spinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {   // redirect if not logged in
    if (!user?.id && !loading) {
      toast.error("Not Logged In Redirecting To Login Page...");
      router.replace("/login");
    }
  }, [user,loading]);

  if (!user && !loading) {
    return (
      <div className="w-screen h-screen bg-background flex justify-center items-center text-2xl">
        <div>
          Not Logged in
          {error?.message}
        </div>
      </div>
    );
  }

  if (!user && loading) {
    return (
      <div className=" w-screen h-screen bg-background flex justify-center items-center">
        <Spinner variant="ring" size={50} />
      </div>
    );
  }


  if(user && !error && !user.isOnboarded){
    router.replace("/onboarding")
  }

  if (user && !error) {
    return children;
  }
};
