"use client";

import { cn } from "@/lib/utils";

interface VARIncidentMarkerProps {
  type: string;
  x: number;
  y: number;
  size?: number;
  label?: string;
  animated?: boolean;
  className?: string;
}

const incidentStyles: Record<string, { color: string; icon: string }> = {
  offside: { color: "#A855F7", icon: "🚩" },
  handball: { color: "#FF6B00", icon: "✋" },
  penalty: { color: "#FF2D2D", icon: "⚖️" },
  "red-card": { color: "#E53935", icon: "🟥" },
  "yellow-card": { color: "#FFB800", icon: "🟨" },
  goal: { color: "#FFD700", icon: "⚽" },
  foul: { color: "#FF6B6B", icon: "💥" },
  substitution: { color: "#4FC3F7", icon: "🔄" },
  general: { color: "#9CA3AF", icon: "📌" },
};

export function VARIncidentMarker({
  type,
  x,
  y,
  size = 24,
  label,
  animated = false,
  className,
}: VARIncidentMarkerProps) {
  const style = incidentStyles[type] || incidentStyles.general;

  return (
    <g className={cn(className)}>
      {/* Pulsing ring */}
      {animated && (
        <circle
          cx={x}
          cy={y}
          r={size + 8}
          fill="none"
          stroke={style.color}
          strokeWidth={2}
          opacity={0.3}
          className="animate-stadiumPulse"
        />
      )}

      {/* Marker background */}
      <circle
        cx={x}
        cy={y}
        r={size / 2}
        fill={`${style.color}25`}
        stroke={style.color}
        strokeWidth={2}
        className={cn(
          "transition-all duration-300",
          animated && "animate-pulseGlow"
        )}
        style={{ "--glow-color": `${style.color}30` } as React.CSSProperties}
      />

      {/* Icon */}
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontSize={size * 0.45}
        className="select-none pointer-events-none"
      >
        {style.icon}
      </text>

      {/* Label */}
      {label && (
        <g>
          <rect
            x={x - 30}
            y={y + size / 2 + 4}
            width={60}
            height={16}
            rx={4}
            fill="rgba(10, 36, 22, 0.9)"
            stroke={style.color}
            strokeWidth={0.5}
          />
          <text
            x={x}
            y={y + size / 2 + 15}
            textAnchor="middle"
            fill="white"
            fontSize={8}
            fontWeight="bold"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
