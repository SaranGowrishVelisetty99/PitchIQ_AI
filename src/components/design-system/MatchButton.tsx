"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const matchButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-900 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-gold-500 text-pitch-900 hover:bg-gold-400 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30",
        home: "bg-home text-white hover:bg-blue-500 shadow-lg shadow-home-glow/20",
        away: "bg-away text-white hover:bg-red-500 shadow-lg shadow-away-glow/20",
        outline: "border border-gold-500/30 text-text-secondary hover:bg-gold-500/10 hover:text-gold-500 hover:border-gold-500/50",
        ghost: "text-text-tertiary hover:text-text-primary hover:bg-pitch-600/50",
        destructive: "bg-card-red/20 text-card-red hover:bg-card-red/30",
      },
      size: {
        xs: "h-7 gap-1 px-2 text-[10px]",
        sm: "h-8 gap-1.5 px-3 text-xs",
        md: "h-10 gap-2 px-4 text-sm",
        lg: "h-12 gap-2.5 px-6 text-base",
        xl: "h-14 gap-3 px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface MatchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof matchButtonVariants> {
  loading?: boolean;
}

export const MatchButton = forwardRef<HTMLButtonElement, MatchButtonProps>(
  ({ className, variant, size, fullWidth, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(matchButtonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
MatchButton.displayName = "MatchButton";
