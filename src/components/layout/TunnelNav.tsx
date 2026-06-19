"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, TrendingUp, ShieldCheck, BookOpen, Brain, MessageSquare } from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  agent: string;
}

const iconClass = "w-5 h-5 shrink-0";

const navItems: NavItem[] = [
  { href: "/", icon: <Home className={iconClass} />, label: "Home", agent: "PitchIQ" },
  { href: "/formation", icon: <LayoutGrid className={iconClass} />, label: "Formation", agent: "Formation Agent" },
  { href: "/momentum", icon: <TrendingUp className={iconClass} />, label: "Momentum", agent: "Momentum Agent" },
  { href: "/var", icon: <ShieldCheck className={iconClass} />, label: "VAR", agent: "VAR Agent" },
  { href: "/story", icon: <BookOpen className={iconClass} />, label: "Story", agent: "Story Agent" },
  { href: "/tactical", icon: <Brain className={iconClass} />, label: "Tactical", agent: "Tactical Agent" },
  { href: "/chat", icon: <MessageSquare className={iconClass} />, label: "Chat", agent: "AI Chat" },
];

export function TunnelNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-44 bg-pitch-800/90 backdrop-blur-sm border-r border-gold-500/10 shrink-0">
      <div className="flex flex-col gap-0.5 py-4 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-800",
                  isActive
                    ? "bg-gold-500/15 text-gold-500 shadow-sm shadow-gold-500/15"
                    : "text-text-tertiary hover:text-text-primary hover:bg-pitch-600/50"
              )}
            >
              <span className={cn(
                "transition-transform duration-200 shrink-0",
                isActive && "scale-110",
                !isActive && "group-hover:scale-110"
              )}>
                {item.icon}
              </span>
              <span className="text-sm font-medium truncate">{item.label}</span>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-gold-500" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto mb-4 flex flex-col items-center gap-1 px-3">
        <div className="w-full h-px bg-gold-500/10 mb-2" />
        <span className="text-[10px] text-text-tertiary/50 uppercase tracking-wider">v0.2</span>
      </div>
    </nav>
  );
}
