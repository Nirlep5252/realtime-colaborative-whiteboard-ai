import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const name = req.headers.get("boardName");

  if (session && session.user && name) {
    const data = await prisma.board.findMany({
      where: {
        owner: session.user.id
      }
    })
    if (data.length > 10) {
      return new Response("Max board limit is: 10", {
        status: 403
      })
    }

    const res = await prisma.board.create({
      data: {
        owner: session.user.id,
        name: name
      }
    })

    return NextResponse.json(res);
  } else {
    return new Response("Unauthorized OR missing details", {
      status: 403
    })
  }
}

export { handler as POST };
