"use client";

import { useMemo } from "react";
import { Pitch } from "./Pitch";
import { PitchMarkings } from "./PitchMarkings";
import { PlayerDotGroup } from "./PlayerDot";

export const formations: Record<string, Array<{ x: number; y: number; role: string }>> = {
  "4-4-2": [
    { x: 70, y: 175, role: "GK" },
    { x: 120, y: 60, role: "LB" },
    { x: 120, y: 140, role: "CB" },
    { x: 120, y: 210, role: "CB" },
    { x: 120, y: 290, role: "RB" },
    { x: 200, y: 60, role: "LM" },
    { x: 200, y: 130, role: "CM" },
    { x: 200, y: 220, role: "CM" },
    { x: 200, y: 290, role: "RM" },
    { x: 300, y: 110, role: "ST" },
    { x: 300, y: 240, role: "ST" },
  ],
  "4-3-3": [
    { x: 70, y: 175, role: "GK" },
    { x: 120, y: 60, role: "LB" },
    { x: 120, y: 140, role: "CB" },
    { x: 120, y: 210, role: "CB" },
    { x: 120, y: 290, role: "RB" },
    { x: 200, y: 100, role: "CM" },
    { x: 200, y: 175, role: "CM" },
    { x: 200, y: 250, role: "CM" },
    { x: 300, y: 50, role: "LW" },
    { x: 320, y: 175, role: "ST" },
    { x: 300, y: 300, role: "RW" },
  ],
  "3-5-2": [
    { x: 70, y: 175, role: "GK" },
    { x: 120, y: 100, role: "CB" },
    { x: 120, y: 175, role: "CB" },
    { x: 120, y: 250, role: "CB" },
    { x: 200, y: 40, role: "LWB" },
    { x: 200, y: 140, role: "CM" },
    { x: 210, y: 175, role: "CM" },
    { x: 200, y: 210, role: "CM" },
    { x: 200, y: 310, role: "RWB" },
    { x: 310, y: 120, role: "ST" },
    { x: 310, y: 230, role: "ST" },
  ],
  "3-4-3": [
    { x: 70, y: 175, role: "GK" },
    { x: 120, y: 100, role: "CB" },
    { x: 120, y: 175, role: "CB" },
    { x: 120, y: 250, role: "CB" },
    { x: 200, y: 60, role: "LM" },
    { x: 200, y: 150, role: "CM" },
    { x: 200, y: 200, role: "CM" },
    { x: 200, y: 290, role: "RM" },
    { x: 300, y: 50, role: "LW" },
    { x: 320, y: 175, role: "ST" },
    { x: 300, y: 300, role: "RW" },
  ],
  "5-3-2": [
    { x: 70, y: 175, role: "GK" },
    { x: 110, y: 40, role: "LWB" },
    { x: 110, y: 120, role: "CB" },
    { x: 110, y: 175, role: "CB" },
    { x: 110, y: 230, role: "CB" },
    { x: 110, y: 310, role: "RWB" },
    { x: 190, y: 140, role: "CM" },
    { x: 190, y: 175, role: "CM" },
    { x: 190, y: 210, role: "CM" },
    { x: 300, y: 130, role: "ST" },
    { x: 300, y: 220, role: "ST" },
  ],
  "4-2-3-1": [
    { x: 70, y: 175, role: "GK" },
    { x: 120, y: 60, role: "LB" },
    { x: 120, y: 140, role: "CB" },
    { x: 120, y: 210, role: "CB" },
    { x: 120, y: 290, role: "RB" },
    { x: 190, y: 130, role: "CDM" },
    { x: 190, y: 220, role: "CDM" },
    { x: 270, y: 50, role: "LW" },
    { x: 280, y: 175, role: "CAM" },
    { x: 270, y: 300, role: "RW" },
    { x: 340, y: 175, role: "ST" },
  ],
};

interface FormationVisualProps {
  formation: string;
  team?: "home" | "away";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  showLabels?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 200, height: 240, playerSize: "sm" as const },
  md: { width: 300, height: 360, playerSize: "md" as const },
  lg: { width: 400, height: 480, playerSize: "lg" as const },
};

export function FormationVisual({
  formation,
  team = "home",
  size = "md",
  animate = true,
  showLabels = false,
  className,
}: FormationVisualProps) {
  const dims = sizeMap[size];
  const positions = formations[formation] || formations["4-4-2"];

  // Scale positions to pitch dimensions
  const scaledPositions = useMemo(() => {
    const srcW = 400;
    const srcH = 350;
    const scaleX = dims.width / srcW;
    const scaleY = dims.height / srcH;
    return positions.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
      name: showLabels ? p.role : undefined,
    }));
  }, [positions, dims, showLabels]);

  return (
    <Pitch width={dims.width} height={dims.height} className={className}>
      <PitchMarkings width={dims.width} height={dims.height} showLabels={false} />
      <PlayerDotGroup
        positions={scaledPositions}
        team={team}
        size={dims.playerSize}
        formation={formation}
        className={animate ? "animate-fadeInScale" : ""}
      />
    </Pitch>
  );
}
