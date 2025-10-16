import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!session.user.isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if (pathname === "/dashboard") {
      if (session.user.role === "TEACHER") {
        return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
      } else if (session.user.role === "STUDENT") {
        return NextResponse.redirect(new URL("/dashboard/student",req.url));
      }
    }
    // ROLE BASED ACCESS
    if (
      pathname.startsWith("/dashboard/student") &&
      session.user.role != "STUDENT"
    ) {
      return NextResponse.redirect(
        new URL(`/dashboard/${session.user.role}`, req.url)
      );
    }

    if (
      pathname.startsWith("/dashboard/teacher") &&
      session.user.role != "TEACHER"
    ) {
      return NextResponse.redirect(
        new URL(`/dashboard/${session.user.role}`, req.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard/:path*"],
};
