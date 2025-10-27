import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const reqbody = await request.json();
  const { groupName, description, emails, creatorId } = reqbody;

  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.user.role != "TEACHER") {
    return NextResponse.json({ error: "Not Authorized" }, { status: 403 });
  }

  const groupRedudancyCheck = await prisma.group.findFirst({
    where: {
      name: groupName,
      creatorId: session.user.id,
    },
  });

  if (groupRedudancyCheck?.id) {
    return NextResponse.json(
      { error: "Group with same name already exists" },
      { status: 409 }
    );
  }

  const newGroup = await prisma.group.create({
    data: {
      name: groupName,
      description: description,
      creatorId: session.user.id,
    },
  });

  const notFoundMembers = <string[]>[];
  const notStudents = <string[]>[];

  await Promise.all(
    emails.map(async (email:string) => {
      const user = await prisma.user.findFirst({ where: { email } });

      if (!user) {
        notFoundMembers.push(email);
        return;
      }

      if (user.role === "TEACHER") {
        notStudents.push(email);
        return;
      }

      await prisma.$transaction([
        prisma.groupMember.create({
          data: {
            groupId: newGroup.id,
            studentId: user.id,
          },
        }),
        prisma.group.update({
          where: { id: newGroup.id },
          data: {
            noOfMembers: { increment: 1 },
          },
        }),
      ]);
    })
  );

  console.log(notFoundMembers, notStudents);

  return NextResponse.json(
    { data: { notFoundMembers, notStudents } },
    { status: 200, statusText: "Group Created Successfully" }
  );
}
