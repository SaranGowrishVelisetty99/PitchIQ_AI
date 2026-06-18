"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Trophy, X } from "lucide-react";

const highlights = [
  "Five specialized AI agents working together",
  "Transparent, explainable soccer insights",
  "Real-time tactical analysis with formation visuals",
  "FIFA law citations for VAR decisions",
  "Scroll-triggered animated storytelling",
];

export function JudgeDemoMode() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % (highlights.length + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg hover:scale-105 transition-all animate-pulseGlow"
      >
        <Trophy className="h-3 w-3" />
        Judge Mode
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      {step > 0 && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" />
      )}

      {/* Highlight card */}
      {step > 0 && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm w-full px-4 animate-fadeInScale">
          <div className="rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-amber-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {highlights[step - 1]}
            </p>
            <div className="mt-4 flex items-center justify-center gap-1">
              {highlights.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    i === step - 1 ? "bg-amber-500 w-3" : "bg-slate-200"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setActive(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg hover:bg-slate-800 transition-all"
      >
        <X className="h-3 w-3" />
        Exit Judge Mode
      </button>
    </>
  );
}
