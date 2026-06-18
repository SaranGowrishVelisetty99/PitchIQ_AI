"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFanPreferences } from "@/hooks/useFanPreferences";
import type { ExpertiseLevel } from "../../../types";

const levels: { value: ExpertiseLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
  { value: "child", label: "Child" },
];

export function FanPreferencesPanel() {
  const { expertiseLevel, favoriteTeam, setExpertiseLevel, setFavoriteTeam, reset } = useFanPreferences();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-500 hover:text-slate-700 transition-colors"
        aria-label="Fan preferences"
      >
        <Settings className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Fan Preferences</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-slate-600">Expertise Level</Label>
                <div className="flex gap-1 mt-1">
                  {levels.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setExpertiseLevel(l.value)}
                      className={`text-[11px] px-2 py-1 rounded-md font-medium transition-all ${
                        expertiseLevel === l.value
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="fav-team" className="text-xs text-slate-600">
                  Favorite Team
                </Label>
                <Input
                  id="fav-team"
                  value={favoriteTeam}
                  onChange={(e) => setFavoriteTeam(e.target.value)}
                  placeholder="e.g. Arsenal, Brazil..."
                  className="mt-1 h-8 text-sm"
                />
              </div>

              <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-slate-500 w-full">
                Reset to defaults
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
