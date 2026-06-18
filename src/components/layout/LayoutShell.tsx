"use client";

import { usePathname } from "next/navigation";
import { TunnelNav } from "./TunnelNav";
import { StadiumHeader } from "./StadiumHeader";
import { StadiumFooter } from "./StadiumFooter";
import type { ReactNode } from "react";

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isChat = pathname === "/chat";

  return (
    <div className="flex flex-1 pt-8">
      {!isChat && <TunnelNav />}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {!isChat && <StadiumHeader />}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        {!isChat && <StadiumFooter />}
      </div>
    </div>
  );
}
