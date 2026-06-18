"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMatch } from "@/contexts/MatchContext";

export function BroadcastBar() {
  const { homeTeam, awayTeam, homeScore, awayScore } = useMatch();
  const [time, setTime] = useState("");
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-8 bg-pitch-900/95 backdrop-blur-md border-b border-gold-500/10 transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
        <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 text-[10px]">
          {homeTeam && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-momentum animate-pulse" />
              <span className="text-momentum font-semibold uppercase tracking-wider">Live</span>
            </span>
          )}
          <span className="text-text-tertiary">{time}</span>
        </div>

        {homeTeam && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-text-secondary">{homeTeam}</span>
            <span className="text-sm font-bold text-gold-500 font-scoreboard">{homeScore}</span>
            <span className="text-[10px] text-text-tertiary">-</span>
            <span className="text-sm font-bold text-gold-500 font-scoreboard">{awayScore}</span>
            <span className="text-[11px] font-semibold text-text-secondary">{awayTeam}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
          <span className="text-[10px] text-text-tertiary/60">PitchIQ AI</span>
        </div>
      </div>
    </div>
  );
}
