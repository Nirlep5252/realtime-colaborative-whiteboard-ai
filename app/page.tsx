import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { LogOut } from "lucide-react";
import CreateBoard from "./components/createboard";
import { prisma } from "./lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) return <></>;
  const boards = await prisma.board.findMany({
    where: {
      owner: session.user.id,
    }
  })

  return (
    <main className="flex h-screen w-screen items-center justify-evenly relative">
      <div className="signout absolute right-10 top-10">
        <Link href="/api/auth/signout">
          <Button variant="light">
            <LogOut className="w-6 h-6" />
          </Button>
        </Link>
      </div>
      <div className="left flex items-center flex-col justify-center gap-4">
        <div className="welcome text-3xl">
          Welcome {session?.user?.name}
        </div>
        <div className="buttons flex gap-4">
          <CreateBoard />
          {/* <Join /> */}
        </div>
      </div>
      <div className="right flex items-center flex-col justify-center gap-4">
        {boards ? <div className="text-xl">Your boards: </div> : <></>}
        <div className="boards flex items-center justify-center gap-2 flex-col">
          {boards.map((board) => {
            return (
              <Link key={board.id} href={`/board/${board.id}`}>
                <Button className="w-64" variant="flat">
                  {board.name}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
