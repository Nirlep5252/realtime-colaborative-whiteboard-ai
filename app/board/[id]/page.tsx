import { prisma } from '@/app/lib/prisma';
import dynamic from 'next/dynamic';
const WhiteBoard = dynamic(
  () => {
    return import("@/app/components/whiteboard");
  },
  { ssr: false }
);

export default async function({ params }: {
  params: {
    id: string;
  }
}) {
  const id = params.id;
  try {
    const res = await prisma.board.findUnique({
      where: {
        id: Number.parseInt(id)
      }
    })
    if (!res)
      return <div className="h-screen w-screen flex items-center justify-center text-3xl">not found</div>;
  } catch {
    return <div className="h-screen w-screen flex items-center justify-center text-3xl">not found</div>;
  }

  return (
    <WhiteBoard id={id} />
  )
}
