"use client";

import { cn } from "@/lib/utils";

interface PitchMarkingsProps {
  width?: number;
  height?: number;
  className?: string;
  showLabels?: boolean;
  labelPosition?: "top" | "bottom" | "both";
}

export function PitchMarkings({
  width = 500,
  height = 350,
  className,
  showLabels = false,
  labelPosition = "both",
}: PitchMarkingsProps) {
  const midX = width / 2;
  const midY = height / 2;
  const boxW = width * 0.157;
  const boxH = height * 0.592;
  const sixYardW = width * 0.052;
  const sixYardH = height * 0.269;
  const goalW = width * 0.025;
  const goalH = height * 0.108;
  const arcR = width * 0.087;
  const centerR = width * 0.087;
  const lineColor = "rgba(255, 255, 255, 0.15)";
  const lineWidth = 1.5;

  const PenaltyArc = ({ cx, cy, side }: { cx: number; cy: number; side: 1 | -1 }) => {
    const sweep = side === 1 ? 1 : 0;
    return (
      <path
        d={`M ${cx} ${cy - arcR} A ${arcR} ${arcR} 0 0 ${sweep} ${cx} ${cy + arcR}`}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
    );
  };

  const CornerArc = ({ cx, cy, rx, ry }: { cx: number; cy: number; rx?: number; ry?: number }) => {
    const r = width * 0.02;
    return (
      <path
        d={`M ${cx + r} ${cy} A ${r} ${r} 0 0 ${cy > midY ? 0 : 1} ${cx} ${cy + r}`}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
    );
  };

  return (
    <g className={cn(className)}>
      {/* Border */}
      <rect x={0} y={0} width={width} height={height} fill="none" stroke={lineColor} strokeWidth={lineWidth} rx="12" />

      {/* Halfway line */}
      <line x1={midX} y1={0} x2={midX} y2={height} stroke={lineColor} strokeWidth={lineWidth} />

      {/* Center circle */}
      <circle cx={midX} cy={midY} r={centerR} fill="none" stroke={lineColor} strokeWidth={lineWidth} />

      {/* Center spot */}
      <circle cx={midX} cy={midY} r={2.5} fill={lineColor} />

      {/* Penalty areas */}
      <rect
        x={0}
        y={midY - boxH / 2}
        width={boxW}
        height={boxH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      <rect
        x={width - boxW}
        y={midY - boxH / 2}
        width={boxW}
        height={boxH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Six-yard boxes */}
      <rect
        x={0}
        y={midY - sixYardH / 2}
        width={sixYardW}
        height={sixYardH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />
      <rect
        x={width - sixYardW}
        y={midY - sixYardH / 2}
        width={sixYardW}
        height={sixYardH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
      />

      {/* Goals */}
      <rect
        x={-goalW / 2}
        y={midY - goalH / 2}
        width={goalW / 2}
        height={goalH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth * 1.5}
      />
      <rect
        x={width}
        y={midY - goalH / 2}
        width={goalW / 2}
        height={goalH}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth * 1.5}
      />

      {/* Penalty spots */}
      <circle cx={sixYardW} cy={midY} r={2.5} fill={lineColor} />
      <circle cx={width - sixYardW} cy={midY} r={2.5} fill={lineColor} />

      {/* Penalty arcs (D) */}
      <PenaltyArc cx={sixYardW} cy={midY} side={1} />
      <PenaltyArc cx={width - sixYardW} cy={midY} side={-1} />

      {/* Corner arcs */}
      <CornerArc cx={0} cy={0} />
      <CornerArc cx={width} cy={0} />
      <CornerArc cx={0} cy={height} />
      <CornerArc cx={width} cy={height} />

      {/* Labels */}
      {showLabels && (
        <>
          {labelPosition !== "bottom" && (
            <>
              <text x={midX} y={midY - centerR - 10} textAnchor="middle" fill={lineColor} fontSize={10} opacity={0.5}>
                HOME HALF
              </text>
              <text x={midX} y={midY + centerR + 20} textAnchor="middle" fill={lineColor} fontSize={10} opacity={0.5}>
                AWAY HALF
              </text>
            </>
          )}
        </>
      )}
    </g>
  );
}
