"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface MomentumPoint {
  minute: number;
  homeValue: number;
  awayValue: number;
  trigger?: string;
}

interface MomentumWaveProps {
  data: MomentumPoint[];
  homeLabel?: string;
  awayLabel?: string;
  className?: string;
  interactive?: boolean;
  height?: number;
  homeColor?: string;
  awayColor?: string;
}

export function MomentumWave({
  data,
  homeLabel = "Home",
  awayLabel = "Away",
  className,
  interactive = true,
  height = 220,
  homeColor = "#0066FF",
  awayColor = "#FF2D2D",
}: MomentumWaveProps) {
  const [hoveredMinute, setHoveredMinute] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: MomentumPoint } | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center rounded-xl bg-pitch-800/50", className)} style={{ height }}>
        <span className="text-text-tertiary/50 text-sm">No momentum data available</span>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.homeValue, d.awayValue)), 100);
  const minVal = 0;
  const range = maxVal - minVal || 1;
  const width = 700;
  const padding = { top: 24, right: 28, bottom: 32, left: 56 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const xScale = (minute: number) => padding.left + (minute / 90) * chartW;
  const yScale = (val: number) => padding.top + chartH - ((val - minVal) / range) * chartH;

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

  const homeArea = `${homePath} L ${xScale(data[data.length - 1].minute)} ${padding.top + chartH} L ${xScale(data[0].minute)} ${padding.top + chartH} Z`;
  const awayArea = `${awayPath} L ${xScale(data[data.length - 1].minute)} ${padding.top + chartH} L ${xScale(data[0].minute)} ${padding.top + chartH} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || data.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    const mouseMinute = (mouseX - padding.left) / chartW * 90;

    const closest = data.reduce((prev, curr) =>
      Math.abs(curr.minute - mouseMinute) < Math.abs(prev.minute - mouseMinute) ? curr : prev
    );

    if (closest && closest.minute !== hoveredMinute) {
      setHoveredMinute(closest.minute);
      setTooltip({
        x: xScale(closest.minute),
        y: Math.min(yScale(closest.homeValue), yScale(closest.awayValue)) - 10,
        data: closest,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredMinute(null);
    setTooltip(null);
  };

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: interactive ? "crosshair" : "default" }}
      >
        <defs>
          <linearGradient id="momentumHomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={homeColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={homeColor} stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="momentumAwayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={awayColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={awayColor} stopOpacity={0.03} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 15, 30, 45, 60, 75, 90].map((min) => (
          <g key={min}>
            <line
              x1={xScale(min)} y1={padding.top}
              x2={xScale(min)} y2={padding.top + chartH}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={xScale(min)}
              y={height - 6}
              textAnchor="middle"
              fill="rgba(255,255,255,0.25)"
              fontSize={9}
              className="font-scoreboard"
            >
              {min}&apos;
            </text>
          </g>
        ))}

        {/* Half-time line */}
        <line
          x1={xScale(45)} y1={padding.top}
          x2={xScale(45)} y2={padding.top + chartH}
          stroke="rgba(255,215,0,0.1)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={xScale(45)}
          y={padding.top - 6}
          textAnchor="middle"
          fill="rgba(255,215,0,0.2)"
          fontSize={8}
        >
          HT
        </text>

        {/* Area fills */}
        <path d={homeArea} fill="url(#momentumHomeGrad)" />
        <path d={awayArea} fill="url(#momentumAwayGrad)" />

        {/* Lines */}
        <path
          d={homePath}
          fill="none"
          stroke={homeColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-opacity duration-300"
        />
        <path
          d={awayPath}
          fill="none"
          stroke={awayColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-opacity duration-300"
        />

        {/* Trigger markers */}
        {data.filter((d) => d.trigger).map((d, i) => (
          <g key={`trigger-${i}`}>
            <line
              x1={xScale(d.minute)} y1={padding.top}
              x2={xScale(d.minute)} y2={padding.top + chartH}
              stroke="#FFD700"
              strokeOpacity={0.4}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <circle
              cx={xScale(d.minute)}
              cy={yScale((d.homeValue + d.awayValue) / 2)}
              r={5}
              fill="#FFD700"
              stroke="#0A2416"
              strokeWidth={2}
              className="animate-stadiumPulse"
            />
            <text
              x={xScale(d.minute)}
              y={yScale((d.homeValue + d.awayValue) / 2) - 10}
              textAnchor="middle"
              fill="#FFD700"
              fontSize={8}
              fontWeight="bold"
            >
              ⚽
            </text>
          </g>
        ))}

        {/* Hover vertical line */}
        {hoveredMinute !== null && (
          <line
            x1={xScale(hoveredMinute)} y1={padding.top}
            x2={xScale(hoveredMinute)} y2={padding.top + chartH}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        )}

        {/* Tooltip */}
        {tooltip && (
          <g transform={`translate(${Math.max(padding.left, Math.min(width - padding.right - 100, tooltip.x - 50))}, ${Math.max(0, tooltip.y - 50)})`}>
            <rect x={0} y={0} width={100} height={42} rx={6} fill="#0F341F" stroke="rgba(255,215,0,0.2)" strokeWidth={1} />
            <text x={50} y={16} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={8} className="font-scoreboard">
              {tooltip.data.minute}&apos;
            </text>
            <text x={10} y={30} fill={homeColor} fontSize={8} fontWeight="bold">{tooltip.data.homeValue}%</text>
            <text x={90} y={30} textAnchor="end" fill={awayColor} fontSize={8} fontWeight="bold">{tooltip.data.awayValue}%</text>
            {tooltip.data.trigger && (
              <text x={50} y={40} textAnchor="middle" fill="#FFD700" fontSize={7}>⚽ {tooltip.data.trigger}</text>
            )}
          </g>
        )}

        {/* Labels */}
        <text x={4} y={padding.top + 12} fill={homeColor} fontSize={9} fontWeight="bold" className="font-scoreboard">
          {homeLabel}
        </text>
        <text x={4} y={padding.top + 24} fill={awayColor} fontSize={9} fontWeight="bold" className="font-scoreboard">
          {awayLabel}
        </text>
      </svg>
    </div>
  );
}
