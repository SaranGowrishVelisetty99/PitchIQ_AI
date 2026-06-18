import { cn } from "@/lib/utils";
import type { SourceCitation } from "../../../types";

interface SourceCitationProps {
  sources: SourceCitation[];
  className?: string;
}

export function SourceCitationList({ sources, className }: SourceCitationProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Sources</h4>
      <div className="max-h-32 overflow-y-auto">
        <div className="space-y-2">
          {sources.map((source, i) => (
            <div
              key={i}
              className="rounded-lg border border-pitch-700 bg-pitch-800 p-2.5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gold-500">
                  {source.title}
                </span>
                {source.similarity > 0 && (
                  <span className="text-[10px] text-text-tertiary">
                    {(source.similarity * 100).toFixed(0)}% match
                  </span>
                )}
              </div>
              {source.section && (
                <p className="text-[10px] text-text-tertiary mb-1">{source.section}</p>
              )}
              {source.excerpt && (
                <p className="text-[11px] text-text-tertiary line-clamp-2">
                  {source.excerpt}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
