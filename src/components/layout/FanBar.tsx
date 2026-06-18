"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", icon: "🏟️", label: "Home" },
  { href: "/formation", icon: "📐", label: "Formation" },
  { href: "/momentum", icon: "📈", label: "Momentum" },
  { href: "/var", icon: "🎯", label: "VAR" },
  { href: "/chat", icon: "💬", label: "Chat" },
];

export function FanBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-pitch-900/95 backdrop-blur-md border-t border-gold-500/10 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all duration-200 relative focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-inset",
                isActive
                  ? "text-gold-500"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              <span className={cn(
                "text-lg transition-transform duration-200",
                isActive && "scale-110"
              )}>
                {tab.icon}
              </span>
              <span className={cn(
                "text-[9px] font-semibold uppercase tracking-wider",
                isActive ? "text-gold-500" : "text-text-tertiary"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gold-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
