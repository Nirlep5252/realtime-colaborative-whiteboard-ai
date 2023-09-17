import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.headers.get("id");
  if (!id) {
    return new Response("ID missing in headers.", {
      status: 400
    })
  }
  try {
    Number.parseInt(id)
  } catch {
    return new Response("ID is not a number.", {
      status: 400
    })
  }

  const res = await prisma.board.findUnique({
    where: {
      id: Number.parseInt(id)
    }
  })

  if (!res) {
    return new Response("Not found", {
      status: 404
    })
  }

  return new Response("", {
    status: 200
  })
}
