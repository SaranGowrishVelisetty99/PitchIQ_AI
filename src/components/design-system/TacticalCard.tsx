"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TacticalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "pitch" | "elevated";
  team?: "home" | "away" | "neutral";
  glow?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const teamGlowMap = {
  home: "shadow-home-glow/10 hover:shadow-home-glow/20",
  away: "shadow-away-glow/10 hover:shadow-away-glow/20",
  neutral: "shadow-gold-500/10 hover:shadow-gold-500/20",
};

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-4 lg:p-5",
  lg: "p-5 lg:p-6",
};

export const TacticalCard = forwardRef<HTMLDivElement, TacticalCardProps>(
  ({ className, variant = "default", team = "neutral", glow = false, hover = true, padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-300",
          // Variant styles
          variant === "default" && "bg-surface-card border border-gold-500/10",
          variant === "glass" && "glass-surface",
          variant === "pitch" && "bg-pitch-800 border border-pitch-600",
          variant === "elevated" && "bg-surface-elevated border border-gold-500/15 shadow-lg",
          // Glow
          glow && `shadow-lg ${teamGlowMap[team]}`,
          // Hover
          hover && "hover:border-gold-500/25 hover:bg-pitch-600/50",
          // Padding
          paddingMap[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TacticalCard.displayName = "TacticalCard";

export function TacticalCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between mb-3", className)}
      {...props}
    />
  );
}

export function TacticalCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold text-text-primary", className)}
      {...props}
    />
  );
}

export function TacticalCardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-text-tertiary", className)}
      {...props}
    />
  );
}

export function TacticalCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function TacticalCardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between mt-3 pt-3 border-t border-gold-500/10", className)}
      {...props}
    />
  );
}
