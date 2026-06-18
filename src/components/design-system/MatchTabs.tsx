"use client";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  badgeVariant?: "home" | "away" | "goal" | "var" | "info";
}

interface MatchTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  className?: string;
}

export function MatchTabs({ tabs, activeTab, onChange, variant = "default", className }: MatchTabsProps) {
  return (
    <div
      className={cn(
        "flex",
        variant === "default" && "gap-1 bg-pitch-800 rounded-lg p-1",
        variant === "pills" && "gap-1.5 flex-wrap",
        variant === "underline" && "gap-0 border-b border-gold-500/10",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap",
              variant === "default" && [
                "px-3 py-2 rounded-md",
                isActive
                  ? "bg-surface-card text-gold-500 shadow-sm"
                  : "text-text-tertiary hover:text-text-primary",
              ],
              variant === "pills" && [
                "px-3 py-1.5 rounded-full border",
                isActive
                  ? "bg-gold-500/15 text-gold-500 border-gold-500/30"
                  : "text-text-tertiary border-gold-500/10 hover:text-text-primary hover:border-gold-500/20",
              ],
              variant === "underline" && [
                "px-4 py-2.5 relative",
                isActive
                  ? "text-gold-500"
                  : "text-text-tertiary hover:text-text-primary",
                isActive && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold-500 after:rounded-full",
              ]
            )}
          >
            {tab.icon && <span className="text-sm">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[9px] font-bold px-1",
                  tab.badgeVariant === "home" && "bg-home/20 text-home",
                  tab.badgeVariant === "away" && "bg-away/20 text-away",
                  tab.badgeVariant === "goal" && "bg-gold-500/20 text-gold-500",
                  tab.badgeVariant === "var" && "bg-var/20 text-var",
                  (!tab.badgeVariant || tab.badgeVariant === "info") && "bg-pitch-600 text-text-tertiary"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
