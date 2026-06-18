import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  score: number;
  className?: string;
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  const safeScore = score && !isNaN(score) ? Math.min(100, Math.max(0, score > 1 ? Math.round(score) : Math.round(score * 100))) : 0;

  const getColor = () => {
    if (safeScore >= 90) return "text-momentum";
    if (safeScore >= 70) return "text-gold-500";
    return "text-card-red";
  };

  const getLabel = () => {
    if (safeScore >= 90) return "High";
    if (safeScore >= 70) return "Medium";
    return "Low";
  };

  const getIndicatorClass = () => {
    if (safeScore >= 90) return "bg-momentum";
    if (safeScore >= 70) return "bg-gold-500";
    return "bg-card-red";
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-tertiary">Confidence</span>
        <span className={cn("font-semibold", getColor())}>
          {safeScore}% - {getLabel()}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-pitch-700 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", getIndicatorClass())}
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}
