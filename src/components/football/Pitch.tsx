"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface PitchProps {
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  width?: number;
  height?: number;
  onPositionClick?: (x: number, y: number) => void;
  variant?: "standard" | "minimal" | "heatmap";
}

export function Pitch({
  children,
  className,
  interactive = false,
  width = 500,
  height = 350,
  onPositionClick,
  variant = "standard",
}: PitchProps) {
  const grassId = useId();
  const stripeId = useId();

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onPositionClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;
    onPositionClick(x, y);
  };

  return (
    <div className={cn("relative", className)} style={{ aspectRatio: `${width}/${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full rounded-xl overflow-hidden"
        onClick={handleClick}
        style={{ cursor: interactive ? "crosshair" : "default" }}
        role="img"
        aria-label="Football pitch"
      >
        <defs>
          <linearGradient id={grassId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0B2D1A" />
            <stop offset="50%" stopColor="#16422A" />
            <stop offset="100%" stopColor="#0B2D1A" />
          </linearGradient>
          <linearGradient id={stripeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="48%" stopColor="transparent" />
            <stop offset="48%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="52%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="52%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <clipPath id={`pitchClip-${grassId}`}>
            <rect width={width} height={height} rx="12" />
          </clipPath>
        </defs>

        <rect width={width} height={height} fill={`url(#${grassId})`} rx="12" />
        <rect width={width} height={height} fill={`url(#${stripeId})`} rx="12" />

        {variant !== "minimal" && (
          <g clipPath={`url(#pitchClip-${grassId})`} opacity={0.06}>
            <rect width={width} height={height} fill="#FFD700" className="animate-pitchScan" />
          </g>
        )}

        {children}
      </svg>

      {interactive && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-pitch-900/70 text-[9px] text-text-tertiary">
          <span>✏️</span>
          <span>Click to mark</span>
        </div>
      )}
    </div>
  );
}
