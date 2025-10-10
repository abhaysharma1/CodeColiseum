import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const req = await request.json();
  const url = new URL(request.url);
  const query = req.searchValue;
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Number(url.searchParams.get("limit") ?? 20);

  let data;

  if (query == "") {
    data = await prisma.problem.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tags: {
          select: {
            tag: {
              select: {
                name: true, // select only the tag name
              },
            },
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });
  } else {
    data = await prisma.problem.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        OR: [
          { id: query },
          { title: { contains: query, mode: "insensitive" } },
          { number: Number(query) || undefined },
          { difficulty: { equals: query, mode: "insensitive" } },
          {
            tags: {
              some: { tag: { name: { contains: query, mode: "insensitive" } } },
            },
          },
        ],
      },
      include: {
        tags: {
          select: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });
  }

  return NextResponse.json(data, {
    status: 201,
    statusText: "Problems fetched Successfully",
  });
}
