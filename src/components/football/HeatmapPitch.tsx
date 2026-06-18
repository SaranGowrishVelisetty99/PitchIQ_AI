"use client";

import { useId } from "react";
import { Pitch } from "./Pitch";
import { PitchMarkings } from "./PitchMarkings";

export interface HeatmapZone {
  x: number;
  y: number;
  intensity: number;
  radius?: number;
  label?: string;
}

interface HeatmapPitchProps {
  zones: HeatmapZone[];
  team?: "home" | "away";
  width?: number;
  height?: number;
  showMarkings?: boolean;
  animated?: boolean;
}

export function HeatmapPitch({
  zones,
  team = "home",
  width = 500,
  height = 350,
  showMarkings = true,
  animated = true,
}: HeatmapPitchProps) {
  const gradientId = useId();
  const color = team === "home" ? "#0066FF" : "#FF2D2D";
  const maxIntensity = Math.max(...zones.map((z) => z.intensity), 0.01);

  return (
    <Pitch width={width} height={height}>
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="40%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {showMarkings && <PitchMarkings width={width} height={height} />}
      {zones.map((zone, i) => {
        const r = (zone.radius ?? 45) * (zone.intensity / maxIntensity);
        return (
          <g key={i}>
            <circle
              cx={zone.x}
              cy={zone.y}
              r={Math.max(r, 10)}
              fill={`url(#${gradientId})`}
              opacity={0.2 + 0.6 * (zone.intensity / maxIntensity)}
              className={animated ? "animate-fadeInScale" : ""}
              style={{ animationDelay: `${i * 60}ms` }}
            />
            {zone.label && (
              <g>
                <rect
                  x={zone.x - 25}
                  y={zone.y + 6}
                  width={50}
                  height={16}
                  rx={4}
                  fill="rgba(15, 52, 31, 0.85)"
                  stroke={color}
                  strokeWidth={0.5}
                />
                <text
                  x={zone.x}
                  y={zone.y + 17}
                  textAnchor="middle"
                  fill="white"
                  fontSize={8}
                  fontWeight="bold"
                >
                  {zone.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${width - 60}, 10)`}>
        <text x={0} y={0} fill="rgba(255,255,255,0.3)" fontSize={7}>Low</text>
        <rect x={0} y={4} width={50} height={6} rx={3} fill={`url(#${gradientId})`} />
        <text x={50} y={16} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={7}>High</text>
      </g>
    </Pitch>
  );
}
