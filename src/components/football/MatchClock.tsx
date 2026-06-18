"use client";

import { cn } from "@/lib/utils";

interface MatchClockProps {
  minute: number;
  injuryTime?: number;
  half?: 1 | 2;
  status?: "live" | "ht" | "ft" | "upcoming";
  className?: string;
}

export function MatchClock({
  minute,
  injuryTime,
  half = 1,
  status = "live",
  className,
}: MatchClockProps) {
  const totalMinutes = 45 + (half === 2 ? 45 : 0);
  const displayMinute = Math.min(minute, totalMinutes);
  const progress = displayMinute / totalMinutes;

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference * (1 - progress);

  const isLive = status === "live";
  const isHT = status === "ht";
  const isFT = status === "ft";

  const display = isFT
    ? "FT"
    : isHT
    ? "HT"
    : `${displayMinute}${injuryTime ? `+${injuryTime}` : ""}`;

  return (
    <div className={cn("relative flex items-center justify-center w-20 h-20", className)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        {isLive && (
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="url(#clockGradient)"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        )}
        <defs>
          <linearGradient id="clockGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "text-sm font-bold font-scoreboard tabular-nums",
          isFT ? "text-text-tertiary" : isHT ? "text-gold-500" : "text-momentum"
        )}>
          {display}
        </span>
        <span className="text-[8px] text-text-tertiary uppercase tracking-wider">
          {isLive ? (half === 1 ? "1H" : "2H") : status}
        </span>
      </div>
    </div>
  );
}
