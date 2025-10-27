import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Add CSP headers for all routes to allow GitHub OAuth
  const response = NextResponse.next();
  
  // Configure CSP to allow GitHub assets and inline scripts with nonce/hash
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://github.githubassets.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' https://github.com https://api.github.com;
    frame-src 'self' https://github.com;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // If it's not a protected route, return with CSP headers
  if (!pathname.startsWith("/dashboard")) {
    return response;
  }

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

    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
