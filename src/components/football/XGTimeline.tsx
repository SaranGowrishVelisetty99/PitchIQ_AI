"use client";

import { cn } from "@/lib/utils";

export interface XGPoint {
  minute: number;
  homeValue: number;
  awayValue: number;
  event?: string;
}

export type xGDataPoint = XGPoint;

interface XGTimelineProps {
  data: XGPoint[];
  homeLabel?: string;
  awayLabel?: string;
  height?: number;
  className?: string;
}

export function XGTimeline({
  data,
  homeLabel = "Home",
  awayLabel = "Away",
  height = 150,
  className,
}: XGTimelineProps) {
  if (!data || data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg bg-pitch-800/30", className)} style={{ height }}>
        <span className="text-text-tertiary/50 text-xs">No xG data</span>
      </div>
    );
  }

  const width = 600;
  const padding = { top: 20, right: 20, bottom: 28, left: 46 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxXG = Math.max(...data.map((d) => Math.max(d.homeValue, d.awayValue, 0.5)), 0.5);
  const xScale = (minute: number) => padding.left + (minute / 90) * chartW;
  const yScale = (val: number) => padding.top + chartH - (val / maxXG) * chartH;

  const homePath = data.map((d, i) => {
    const x = xScale(d.minute);
    const y = yScale(d.homeValue);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const awayPath = data.map((d, i) => {
    const x = xScale(d.minute);
    const y = yScale(d.awayValue);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="xgHomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0066FF" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#0066FF" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="xgAwayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF2D2D" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#FF2D2D" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 15, 30, 45, 60, 75, 90].map((min) => (
          <g key={min}>
            <line x1={xScale(min)} y1={padding.top} x2={xScale(min)} y2={padding.top + chartH} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          </g>
        ))}

        {/* xG axis lines */}
        {[0, 0.5, 1, 1.5, 2].filter((v) => v <= maxXG).map((val) => (
          <line
            key={val}
            x1={padding.left} y1={yScale(val)}
            x2={width - padding.right} y2={yScale(val)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        ))}

        {/* Area fills */}
        <path d={`${homePath} L ${xScale(data[data.length - 1].minute)} ${padding.top + chartH} L ${xScale(data[0].minute)} ${padding.top + chartH} Z`} fill="url(#xgHomeGrad)" />
        <path d={`${awayPath} L ${xScale(data[data.length - 1].minute)} ${padding.top + chartH} L ${xScale(data[0].minute)} ${padding.top + chartH} Z`} fill="url(#xgAwayGrad)" />

        {/* Lines */}
        <path d={homePath} fill="none" stroke="#0066FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={awayPath} fill="none" stroke="#FF2D2D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Event markers */}
        {data.filter((d) => d.event).map((d, i) => (
          <g key={`event-${i}`}>
            <circle cx={xScale(d.minute)} cy={yScale(Math.max(d.homeValue, d.awayValue))} r={4} fill="#FFD700" stroke="#0A2416" strokeWidth={1.5} />
          </g>
        ))}

        {/* Labels */}
        <text x={4} y={padding.top + 10} fill="#0066FF" fontSize={8} fontWeight="bold" className="font-scoreboard">{homeLabel}</text>
        <text x={4} y={padding.top + 20} fill="#FF2D2D" fontSize={8} fontWeight="bold" className="font-scoreboard">{awayLabel}</text>
        <text x={width - padding.right} y={padding.top} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize={7} className="font-scoreboard">xG</text>

        {/* Minute labels */}
        {[0, 15, 30, 45, 60, 75, 90].map((min) => (
          <text key={min} x={xScale(min)} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={7} className="font-scoreboard">
            {min}&apos;
          </text>
        ))}
      </svg>
    </div>
  );
}
