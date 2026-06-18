"use client";

import { cn } from "@/lib/utils";

interface StoryChapter {
  title: string;
  minuteRange: string;
  description?: string;
  emotion?: "drama" | "heartbreak" | "tension" | "joy" | "calm" | "excitement";
}

interface StoryTimelineProps {
  chapters: StoryChapter[];
  activeIndex: number;
  onChapterClick: (index: number) => void;
  className?: string;
}

const emotionEmoji: Record<string, string> = {
  drama: "🎭",
  heartbreak: "💔",
  tension: "😱",
  joy: "🏆",
  calm: "🌊",
  excitement: "⚡",
};

const emotionColors: Record<string, string> = {
  drama: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  heartbreak: "text-red-400 border-red-400/30 bg-red-400/10",
  tension: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  joy: "text-gold-500 border-gold-500/30 bg-gold-500/10",
  calm: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  excitement: "text-momentum border-momentum/30 bg-momentum/10",
};

export function StoryTimeline({ chapters, activeIndex, onChapterClick, className }: StoryTimelineProps) {
  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Timeline track */}
      <div className="absolute left-[18px] top-[14px] bottom-[14px] w-0.5 bg-gold-500/10" />

      <div className="space-y-3">
        {chapters.map((chapter, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          const emotion = chapter.emotion || "calm";

          return (
            <button
              key={i}
              onClick={() => onChapterClick(i)}
              className={cn(
                "relative flex items-start gap-3 w-full text-left transition-all duration-300 group",
                "px-2 py-2 rounded-lg",
                isActive && "bg-gold-500/10"
              )}
            >
              {/* Timeline dot */}
              <div className="relative z-10 mt-1 shrink-0">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive
                    ? emotionColors[emotion]
                    : isPast
                    ? "bg-pitch-600 border-pitch-500 text-text-tertiary"
                    : "bg-pitch-700 border-pitch-500 text-text-tertiary/60"
                )}>
                  <span className="text-sm">{emotionEmoji[emotion]}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    isActive ? "text-gold-500" : isPast ? "text-text-secondary" : "text-text-tertiary"
                  )}>
                    {chapter.title}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-scoreboard tabular-nums">
                    {chapter.minuteRange}
                  </span>
                </div>
                {chapter.description && (
                  <p className={cn(
                    "text-xs mt-0.5 line-clamp-1 transition-colors",
                    isActive ? "text-text-secondary" : "text-text-tertiary/70"
                  )}>
                    {chapter.description}
                  </p>
                )}
                <div className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider mt-1",
                  isActive ? "text-gold-500/70" : "text-text-tertiary/50"
                )}>
                  Chapter {i + 1} of {chapters.length}
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-gold-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
