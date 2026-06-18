"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  Brain,
  Home,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  href?: string;
  icon: React.ElementType;
  keywords: string[];
  onSelect?: () => void;
}

const items: CommandItem[] = [
  { id: "home", label: "Home", description: "Back to landing page", href: "/", icon: Home, keywords: ["home", "landing", "start"] },
  { id: "formation", label: "Formation Analysis", description: "Detect formation changes and tactical structures", href: "/formation", icon: LayoutGrid, keywords: ["formation", "tactics", "shapes", "4-4-2"] },
  { id: "momentum", label: "Momentum Tracking", description: "Identify turning points and pressure phases", href: "/momentum", icon: TrendingUp, keywords: ["momentum", "shifts", "dominant", "pressure", "wave"] },
  { id: "var", label: "VAR Explainer", description: "Understand referee decisions with FIFA law citations", href: "/var", icon: ShieldCheck, keywords: ["var", "referee", "decision", "fifa", "offside"] },
  { id: "story", label: "Match Storytelling", description: "Convert match data into compelling narratives", href: "/story", icon: BookOpen, keywords: ["story", "narrative", "chapters", "drama"] },
  { id: "chat", label: "AI Chat", description: "Chat with all five AI agents", href: "/chat", icon: MessageSquare, keywords: ["chat", "talk", "conversation", "ask", "questions"] },
  { id: "tactical", label: "Tactical Explainer", description: "Formation + Momentum dual-agent analysis", href: "/tactical", icon: Brain, keywords: ["tactical", "combined", "dual", "both"] },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? items.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
        );
      })
    : items;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const navigate = useCallback((item: CommandItem) => {
    setOpen(false);
    setQuery("");
    if (item.onSelect) item.onSelect();
    else if (item.href) router.push(item.href);
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      e.preventDefault();
      navigate(filtered[activeIdx]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => { setOpen(v); if (!v) setQuery(""); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b border-slate-200 px-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages and agents..."
            className="flex-1 h-12 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none border-0"
          />
          <kbd className="hidden sm:inline-flex text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2" role="listbox">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">No results found</div>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              role="option"
              aria-selected={i === activeIdx}
              onClick={() => navigate(item)}
              onMouseEnter={() => setActiveIdx(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                i === activeIdx
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0",
                i === activeIdx ? "text-white" : "text-slate-400"
              )} />
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium truncate",
                  i === activeIdx ? "text-white" : "text-slate-900"
                )}>
                  {item.label}
                </div>
                <div className={cn(
                  "text-xs truncate",
                  i === activeIdx ? "text-blue-100" : "text-slate-400"
                )}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-slate-200 px-4 py-2 flex items-center gap-3 text-[10px] text-slate-400">
          <span><kbd className="font-mono border border-slate-200 rounded px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="font-mono border border-slate-200 rounded px-1">↵</kbd> Open</span>
          <span><kbd className="font-mono border border-slate-200 rounded px-1">Esc</kbd> Close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
