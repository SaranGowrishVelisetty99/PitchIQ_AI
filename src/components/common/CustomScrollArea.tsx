"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomScrollAreaProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

function FootballIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" fill="#FAFAFA" stroke="#1a1a1a" strokeWidth="1.2" />
      <polygon points="12,8 14.3,9.7 13.3,12.5 10.7,12.5 9.7,9.7" fill="#1a1a1a" />
      <line x1="12" y1="8" x2="12" y2="2.5" stroke="#1a1a1a" strokeWidth="0.7" />
      <line x1="14.3" y1="9.7" x2="19.5" y2="7.5" stroke="#1a1a1a" strokeWidth="0.7" />
      <line x1="13.3" y1="12.5" x2="18" y2="18" stroke="#1a1a1a" strokeWidth="0.7" />
      <line x1="10.7" y1="12.5" x2="6" y2="18" stroke="#1a1a1a" strokeWidth="0.7" />
      <line x1="9.7" y1="9.7" x2="4.5" y2="7.5" stroke="#1a1a1a" strokeWidth="0.7" />
    </svg>
  );
}

export function CustomScrollArea({ children, className, maxHeight = "400px" }: CustomScrollAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      setScrollProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0);
    };

    const observer = new ResizeObserver(() => {
      const el = containerRef.current;
      if (!el) return;
      setShowScrollbar(el.scrollHeight > el.clientHeight);
      handleScroll();
    });

    observer.observe(el);
    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="overflow-y-auto scrollbar-none pr-2"
        style={{ maxHeight }}
      >
        {children}
      </div>

      {showScrollbar && (
        <div className="absolute right-0 top-0 bottom-0 w-5 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative w-1 h-full max-h-full bg-pitch-700 rounded-full">
            <div
              className="absolute left-1/2 -translate-x-1/2 transition-all duration-150 ease-out"
              style={{ top: `${scrollProgress}%` }}
            >
              <FootballIcon className="w-4 h-4 -translate-y-1/2 drop-shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
