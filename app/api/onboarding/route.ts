import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, role } = body;

  const prisma = new PrismaClient();

  const prevuser = await prisma.user.findFirst({
    where: {
      id: id,
    },
  });

  if (!prevuser) {
    return new NextResponse(JSON.stringify("User Doesn't Exists"), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (prevuser?.isOnboarded) {
    return new NextResponse(JSON.stringify("User is already Onboarded"), {
      status: 300,
      headers: { "Content-Type": "application/json" },
    });
  }

  const updateUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      isOnboarded: true,
      role: role,
    },
  });

  return new NextResponse(JSON.stringify("Onboarded Successfully"), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
