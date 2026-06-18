"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu, X, Settings } from "lucide-react";
import { FanPreferencesPanel } from "@/components/common/FanPreferencesPanel";
import { useState } from "react";

const navLinks = [
  { href: "/formation", label: "Formation" },
  { href: "/momentum", label: "Momentum" },
  { href: "/var", label: "VAR" },
  { href: "/tactical", label: "Tactical" },
  { href: "/story", label: "Story" },
  { href: "/chat", label: "Chat" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      {/* Animated gradient accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 animate-gradientShift" />
      <div className="container mx-auto flex h-15 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/PitchIQ_logo.png"
            alt="PitchIQ AI"
            width={36}
            height={36}
            className="object-contain rounded-full ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all"
          />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Pitch<span className="text-blue-600">IQ</span> AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "relative text-sm font-medium transition-colors px-3",
                  "after:absolute after:bottom-1 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:scale-x-0 after:transition-transform after:duration-300",
                  pathname === link.href
                    ? "text-blue-600 bg-blue-50 after:bg-blue-600 after:scale-x-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 after:bg-blue-500 hover:after:scale-x-100"
                )}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <FanPreferencesPanel />
          <button
            className="md:hidden text-slate-700 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm font-medium",
                    pathname === link.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
