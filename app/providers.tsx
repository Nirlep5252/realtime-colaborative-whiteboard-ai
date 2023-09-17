"use client";

import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";

export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NextUIProvider>
        <SessionProvider>
          <div className="dark">
            {children}
          </div>
        </SessionProvider>
      </NextUIProvider>
    </>
  )
}
