"use client";

import { useState, useCallback, useEffect } from "react";
import type { ExpertiseLevel } from "../../types";

const STORAGE_KEY = "pitchiq-fan-preferences";

interface FanPreferences {
  expertiseLevel: ExpertiseLevel;
  favoriteTeam: string;
}

const defaults: FanPreferences = {
  expertiseLevel: "intermediate",
  favoriteTeam: "",
};

function load(): FanPreferences {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function save(prefs: FanPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* noop */
  }
}

export function useFanPreferences() {
  const [prefs, setPrefs] = useState<FanPreferences>(load);

  useEffect(() => {
    save(prefs);
  }, [prefs]);

  const setExpertiseLevel = useCallback((expertiseLevel: ExpertiseLevel) => {
    setPrefs((prev) => ({ ...prev, expertiseLevel }));
  }, []);

  const setFavoriteTeam = useCallback((favoriteTeam: string) => {
    setPrefs((prev) => ({ ...prev, favoriteTeam }));
  }, []);

  const reset = useCallback(() => {
    setPrefs(defaults);
  }, []);

  return { ...prefs, setExpertiseLevel, setFavoriteTeam, reset };
}
