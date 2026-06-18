"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface StadiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  team?: "home" | "away" | "neutral";
  icon?: React.ReactNode;
}

export const StadiumInput = forwardRef<HTMLInputElement, StadiumInputProps>(
  ({ className, label, error, team = "neutral", icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-semibold uppercase tracking-wider text-text-tertiary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-lg bg-pitch-800 border text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 outline-none",
              "focus:ring-2 focus:ring-offset-2 focus:ring-offset-pitch-900",
              icon ? "pl-9 pr-3 py-2.5" : "px-3 py-2.5",
              error
                ? "border-card-red/50 focus:ring-card-red/30"
                : team === "home"
                ? "border-home/30 focus:ring-home/30 focus:border-home/50"
                : team === "away"
                ? "border-away/30 focus:ring-away/30 focus:border-away/50"
                : "border-gold-500/20 focus:ring-gold-500/30 focus:border-gold-500/50",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[11px] text-card-red">{error}</p>
        )}
      </div>
    );
  }
);
StadiumInput.displayName = "StadiumInput";

export function StadiumTextarea({
  className,
  label,
  error,
  team = "neutral",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  team?: "home" | "away" | "neutral";
}) {
  const textareaId = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-[11px] font-semibold uppercase tracking-wider text-text-tertiary"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full rounded-lg bg-pitch-800 border text-sm text-text-primary placeholder:text-text-tertiary/50 transition-all duration-200 outline-none resize-none",
          "focus:ring-2 focus:ring-offset-2 focus:ring-offset-pitch-900",
          "px-3 py-2.5 min-h-[80px]",
          error
            ? "border-card-red/50 focus:ring-card-red/30"
            : team === "home"
            ? "border-home/30 focus:ring-home/30 focus:border-home/50"
            : team === "away"
            ? "border-away/30 focus:ring-away/30 focus:border-away/50"
            : "border-gold-500/20 focus:ring-gold-500/30 focus:border-gold-500/50",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-[11px] text-card-red">{error}</p>
      )}
    </div>
  );
}
