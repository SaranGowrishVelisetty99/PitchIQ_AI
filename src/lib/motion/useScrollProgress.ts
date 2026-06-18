"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface ScrollProgressOptions {
  threshold?: number;
  once?: boolean;
}

export function useScrollProgress({ threshold = 0, once = false }: ScrollProgressOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        if (visible && once && hasTriggered) return;
        setIsVisible(visible);
        if (visible) {
          setHasTriggered(true);
          const rect = entry.boundingClientRect;
          const totalHeight = entry.rootBounds?.height ?? window.innerHeight;
          const p = Math.min(Math.max((totalHeight - rect.top) / (totalHeight + rect.height), 0), 1);
          setProgress(p);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, hasTriggered]);

  return { ref, progress, isVisible };
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
