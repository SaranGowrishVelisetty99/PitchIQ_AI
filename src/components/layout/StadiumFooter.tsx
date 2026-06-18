"use client";

import { useState } from "react";

const chants = [
  "⚽ Ole, ole, ole!",
  "🎵 You'll Never Walk Alone!",
  "🔥 We're on the ball!",
  "⚡ Come on you Reds!",
  "🏆 Champions!",
  "🎶 Whoa-oh-oh-oh!",
];

export function StadiumFooter() {
  const [chant, setChant] = useState("");
  const [chanting, setChanting] = useState(false);

  const triggerChant = () => {
    if (chanting) return;
    setChanting(true);
    const randomChant = chants[Math.floor(Math.random() * chants.length)];
    setChant(randomChant);
    setTimeout(() => {
      setChanting(false);
      setChant("");
    }, 3000);
  };

  return (
    <footer className="relative border-t border-gold-500/10 bg-pitch-800/50">
      <div className="absolute inset-0 stadium-dots pointer-events-none" />
      <div className="relative px-4 lg:px-6 py-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚽</span>
            <div>
              <span className="text-sm font-bold text-gold-500">
                Pitch<span className="text-text-primary">IQ</span>
              </span>
              <p className="text-[10px] text-text-tertiary">Where Fans Read the Game</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
        <button
          onClick={triggerChant}
          disabled={chanting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pitch-700 text-text-tertiary hover:text-gold-500 hover:bg-pitch-600 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-text-tertiary disabled:hover:bg-pitch-700 focus-visible:ring-2 focus-visible:ring-gold-500"
          aria-label="Fan chant"
        >
              <span className="text-sm">🎵</span>
              <span>Fan Chant</span>
            </button>
            <span className="text-[10px] text-text-tertiary">v0.2.0</span>
          </div>
        </div>

        {chant && (
          <div className="mt-3 text-center animate-fadeInUp">
            <p className="text-sm font-semibold text-gold-500 animate-goalExplosion">
              {chant}
            </p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gold-500/5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-text-tertiary">
            Explainable Soccer Intelligence. Built with FIFA World Cup spirit.
          </p>
          <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
            <button className="hover:text-gold-500 transition-colors">Accessibility</button>
            <button className="hover:text-gold-500 transition-colors">Privacy</button>
            <button className="hover:text-gold-500 transition-colors">GitHub</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
