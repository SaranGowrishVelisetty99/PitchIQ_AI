"use client";

import { cn } from "@/lib/utils";

interface AgentAvatarProps {
  name: "formation" | "momentum" | "var" | "story" | "explanation" | string;
  size?: "xs" | "sm" | "md" | "lg";
  thinking?: boolean;
  className?: string;
}

export const agentConfig: Record<string, { icon: string; color: string; label: string }> = {
  formation: { icon: "📐", color: "#0066FF", label: "Formation" },
  momentum: { icon: "📈", color: "#FFD700", label: "Momentum" },
  var: { icon: "🎯", color: "#FF6B00", label: "VAR" },
  story: { icon: "📖", color: "#A855F7", label: "Story" },
  explanation: { icon: "💡", color: "#34A853", label: "Explain" },
};

const sizeConfig = {
  xs: { container: "w-6 h-6", text: "text-[10px]" },
  sm: { container: "w-8 h-8", text: "text-sm" },
  md: { container: "w-10 h-10", text: "text-base" },
  lg: { container: "w-12 h-12", text: "text-lg" },
};

export function AgentAvatar({ name, size = "sm", thinking = false, className }: AgentAvatarProps) {
  const config = agentConfig[name.toLowerCase()] || { icon: "🤖", color: "#9CA3AF", label: name };
  const dims = sizeConfig[size];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          dims.container,
          thinking && "animate-pulseGlow"
        )}
        style={{
          background: `${config.color}20`,
          border: `2px solid ${config.color}40`,
          "--glow-color": `${config.color}30`,
        } as React.CSSProperties}
      >
        <span className={cn(dims.text)}>{config.icon}</span>
      </div>
      {thinking && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5">
          <span className="absolute inset-0 rounded-full bg-momentum animate-ping" />
          <span className="absolute inset-0 rounded-full bg-momentum" />
        </span>
      )}
    </div>
  );
}
