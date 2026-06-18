"use client";

import { useRef, useEffect, useState, useCallback } from "react";

function BallSvg() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" className="drop-shadow-lg">
      <circle cx="20" cy="20" r="18" fill="white" stroke="#1a1a1a" strokeWidth="0.8" />
      <polygon points="20,5 26,9 24,17 16,17 14,9" fill="#333" opacity="0.25" />
      <polygon points="5,14 11,10 18,13 16,21 8,21" fill="#333" opacity="0.25" />
      <polygon points="35,14 29,10 22,13 24,21 32,21" fill="#333" opacity="0.25" />
      <polygon points="5,27 11,31 18,28 16,21 8,21" fill="#333" opacity="0.25" />
      <polygon points="35,27 29,31 22,28 24,21 32,21" fill="#333" opacity="0.25" />
      <polygon points="20,35 14,31 16,24 24,24 26,31" fill="#333" opacity="0.25" />
    </svg>
  );
}

function PlayerSvg({ kicking }: { kicking: boolean }) {
  return (
    <svg viewBox="0 0 60 80" width="80" height="100" className="drop-shadow-2xl">
      {/* Head */}
      <circle cx="30" cy="12" r="8" fill="#1a1a1a" />
      {/* Body / Jersey */}
      <rect x="22" y="22" width="16" height="22" rx="3" fill="#1a1a1a" />
      {/* Arms */}
      <rect x="16" y="24" width="6" height="14" rx="2" fill="#1a1a1a" transform="rotate(-15 19 31)" />
      <rect x="38" y="24" width="6" height="14" rx="2" fill="#1a1a1a" transform="rotate(15 41 31)" />
      {/* Standing leg */}
      <rect x="25" y="44" width="6" height="22" rx="2" fill="#1a1a1a" />
      <rect x="23" y="64" width="10" height="5" rx="2" fill="#1a1a1a" />
      {/* Kicking leg */}
      <g style={{ transformOrigin: "33px 46px", transition: "transform 0.3s ease-out" }}>
        <rect
          x="31"
          y="44"
          width="6"
          height="22"
          rx="2"
          fill="#1a1a1a"
          transform={kicking ? "rotate(-40 34 46)" : "rotate(-15 34 46)"}
        />
        {/* Boot */}
        <rect
          x="28"
          y="62"
          width="10"
          height="5"
          rx="2"
          fill="#1a1a1a"
          transform={kicking ? "rotate(-40 33 64)" : "rotate(-15 33 64)"}
        />
      </g>
      {/* Number on jersey */}
      <text x="30" y="37" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">10</text>
    </svg>
  );
}

function GoalSvg() {
  return (
    <svg viewBox="0 0 70 60" width="100" height="90" className="drop-shadow-2xl">
      {/* Posts */}
      <rect x="2" y="2" width="3" height="56" rx="1" fill="white" />
      <rect x="65" y="2" width="3" height="56" rx="1" fill="white" />
      <rect x="2" y="2" width="66" height="3" rx="1" fill="white" />
      {/* Net */}
      {[8, 14, 20, 26, 32, 38, 44, 50, 56].map((x) => (
        <line key={`v-${x}`} x1={x} y1="5" x2={x} y2="58" stroke="white" strokeOpacity="0.25" strokeWidth="0.8" />
      ))}
      {[10, 18, 26, 34, 42, 50].map((y) => (
        <line key={`h-${y}`} x1="5" y1={y} x2="65" y2={y} stroke="white" strokeOpacity="0.25" strokeWidth="0.8" />
      ))}
      {/* Diagonal net lines */}
      <line x1="5" y1="5" x2="14" y2="14" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
      <line x1="14" y1="5" x2="23" y2="14" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
      <line x1="23" y1="5" x2="32" y2="14" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
      <line x1="32" y1="5" x2="41" y2="14" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
      <line x1="41" y1="5" x2="50" y2="14" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
      <line x1="50" y1="5" x2="59" y2="14" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
    </svg>
  );
}

function Confetti() {
  const colors = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    drift: (Math.random() - 0.5) * 100,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `-5%`,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function GoalText() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="text-8xl md:text-9xl font-black text-white animate-goalReveal drop-shadow-2xl tracking-tight"
        style={{ textShadow: "0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.3)" }}
      >
        GOAL!
      </span>
    </div>
  );
}

export function ScrollGoalAnimation() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [showGoal, setShowGoal] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollable = sectionHeight - windowHeight;
        const scrolled = -rect.top;
        const p = Math.min(Math.max(scrolled / scrollable, 0), 1);
        setProgress(p);
        setShowGoal(p >= 0.92);
        rafRef.current = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const ballX = 16 + progress * 64;
  const arcHeight = Math.sin(progress * Math.PI);
  const ballY = 58 - arcHeight * 32;

  const ballRotation = progress * 720;
  const ballScale = 1 + Math.sin(progress * Math.PI * 1.5) * 0.15;

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "280vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-emerald-950 via-green-900 to-emerald-950">
        {/* Grass stripes */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)",
            backgroundSize: "80px 100%",
          }}
        />

        {/* Pitch markings */}
        <div className="absolute inset-0 opacity-[0.12]">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[1.5px] border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/30 rounded-full" />
          {/* Halfway line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-full bg-white/30" />
          {/* Left penalty area */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-80 border-[1.5px] border-white/40 rounded-r-lg" />
          <div className="absolute left-24 top-1/2 -translate-y-1/2 w-8 h-28 border-[1.5px] border-white/30 rounded-r-lg" />
          {/* Right penalty area */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-80 border-[1.5px] border-white/40 rounded-l-lg" />
          <div className="absolute right-24 top-1/2 -translate-y-1/2 w-8 h-28 border-[1.5px] border-white/30 rounded-l-lg" />
        </div>

        {/* Stadium spotlight effect */}
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-radial from-white/5 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-1/4 w-1/3 h-full bg-gradient-radial from-white/5 via-transparent to-transparent opacity-30" />

        {/* Top stadium light beams */}
        <div className="absolute top-0 left-[20%] w-px h-32 bg-gradient-to-b from-amber-300/30 to-transparent" />
        <div className="absolute top-0 left-[40%] w-px h-24 bg-gradient-to-b from-amber-300/20 to-transparent" />
        <div className="absolute top-0 left-[60%] w-px h-36 bg-gradient-to-b from-amber-300/25 to-transparent" />
        <div className="absolute top-0 left-[80%] w-px h-28 bg-gradient-to-b from-amber-300/20 to-transparent" />

        {/* Player */}
        <div className="absolute transition-all duration-500" style={{
          left: "8%",
          top: `${50 - Math.max(0, progress - 0.3) * 5}%`,
          transform: "translateY(-50%)",
          opacity: progress < 0.05 ? 0.3 : 1,
        }}>
          <PlayerSvg kicking={progress > 0.08} />
        </div>

        {/* Ball */}
        <div
          className="absolute will-change-transform"
          style={{
            left: `${ballX}%`,
            top: `${ballY}%`,
            transform: `translate(-50%, -50%) rotate(${ballRotation}deg) scale(${ballScale})`,
            opacity: showGoal ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <BallSvg />
        </div>

        {/* Ball trail - subtle arc */}
        {progress > 0.05 && progress < 0.95 && (
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            <path
              d={`M ${16 + 64 * progress} ${58 - Math.sin(progress * Math.PI) * 32}
                  Q 40 15, ${16 + 64 * Math.min(progress + 0.05, 1)} ${58 - Math.sin(Math.min(progress + 0.05, 1) * Math.PI) * 32}`}
              stroke="white"
              strokeOpacity="0.15"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 3"
            />
          </svg>
        )}

        {/* Goal */}
        <div className="absolute transition-all duration-700" style={{
          right: "6%",
          top: `${50 - Math.max(0, progress - 0.6) * 4}%`,
          transform: "translateY(-50%)",
          opacity: progress < 0.1 ? 0.3 : 1,
        }}>
          <GoalSvg />
        </div>

        {/* Goal net ripple when ball scores */}
        {showGoal && (
          <div className="absolute right-[6%] top-1/2 -translate-y-1/2">
            <div className="w-24 h-28 border-2 border-white/30 rounded animate-netRipple" />
          </div>
        )}

        {/* Goal celebration */}
        {showGoal && <Confetti />}
        {showGoal && <GoalText />}

        {/* Scroll progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-75"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-white/50 text-xs font-mono w-8 text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>

        {/* Scroll hint */}
        {progress < 0.02 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/40 text-xs uppercase tracking-widest">Scroll to kick</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/40">
              <path d="M8 3v10M8 13l4-4M8 13l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
