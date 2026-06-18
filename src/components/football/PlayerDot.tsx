"use client";

import { cn } from "@/lib/utils";

interface PlayerDotProps {
  x: number;
  y: number;
  number?: number | string;
  name?: string;
  team?: "home" | "away";
  size?: "sm" | "md" | "lg";
  active?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  sm: { dot: 14, text: 6, label: 7 },
  md: { dot: 20, text: 8, label: 8 },
  lg: { dot: 26, text: 10, label: 9 },
};

export function PlayerDot({
  x,
  y,
  number: playerNumber,
  name,
  team = "home",
  size = "md",
  active = false,
  highlighted = false,
  onClick,
  className,
}: PlayerDotProps) {
  const dims = sizeMap[size];
  const teamColor = team === "home" ? "#0066FF" : "#FF2D2D";
  const teamColorLight = team === "home" ? "rgba(0, 102, 255, 0.3)" : "rgba(255, 45, 45, 0.3)";

  return (
    <g
      className={cn(
        "transition-all duration-300 cursor-pointer",
        highlighted && "animate-pulseGlow",
        className
      )}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {/* Hover/active ring */}
      {(highlighted || active) && (
        <circle
          cx={x}
          cy={y}
          r={dims.dot + 4}
          fill="none"
          stroke={teamColor}
          strokeWidth={2}
          opacity={0.5}
          className={active ? "animate-stadiumPulse" : ""}
        />
      )}

      {/* Glow */}
      <circle
        cx={x}
        cy={y}
        r={dims.dot + 2}
        fill={teamColorLight}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Dot */}
      <circle
        cx={x}
        cy={y}
        r={dims.dot / 2}
        fill={teamColor}
        stroke="white"
        strokeWidth={1.5}
        className="transition-transform duration-200"
      />

      {/* Number */}
      {playerNumber !== undefined && (
        <text
          x={x}
          y={y + dims.text / 3}
          textAnchor="middle"
          fill="white"
          fontSize={dims.text}
          fontWeight="bold"
          className="font-scoreboard select-none pointer-events-none"
        >
          {playerNumber}
        </text>
      )}

      {/* Name label */}
      {name && (
        <text
          x={x}
          y={y + dims.dot + 12}
          textAnchor="middle"
          fill="white"
          fontSize={dims.label}
          opacity={0.85}
          className="font-commentary select-none pointer-events-none"
        >
          {name}
        </text>
      )}
    </g>
  );
}

interface PlayerDotGroupProps {
  positions: Array<{ x: number; y: number; number?: number | string; name?: string }>;
  team?: "home" | "away";
  size?: "sm" | "md" | "lg";
  formation?: string;
  className?: string;
}

export function PlayerDotGroup({
  positions,
  team = "home",
  size = "md",
  formation,
  className,
}: PlayerDotGroupProps) {
  return (
    <g className={className}>
      {formation && (
        <text
          x={50}
          y={15}
          fill="rgba(255,255,255,0.3)"
          fontSize={10}
          className="font-scoreboard"
        >
          {formation}
        </text>
      )}
      {positions.map((pos, i) => (
        <PlayerDot
          key={i}
          x={pos.x}
          y={pos.y}
          number={pos.number}
          name={pos.name}
          team={team}
          size={size}
        />
      ))}
    </g>
  );
}
