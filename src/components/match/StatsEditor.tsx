"use client";

import { useMatch } from "@/contexts/MatchContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function StatsEditor() {
  const { stats, setStats } = useMatch();
  const [open, setOpen] = useState(false);

  const update = (field: keyof typeof stats, side: "home" | "away", value: string) => {
    const num = parseInt(value) || 0;
    setStats({
      ...stats,
      [field]: { ...stats[field], [side]: num },
    });
  };

  const fields: { key: keyof typeof stats; label: string }[] = [
    { key: "possession", label: "Possession (%)" },
    { key: "shots", label: "Shots" },
    { key: "shotsOnTarget", label: "Shots on Target" },
    { key: "passes", label: "Passes" },
    { key: "passAccuracy", label: "Pass Accuracy (%)" },
    { key: "fouls", label: "Fouls" },
    { key: "corners", label: "Corners" },
  ];

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="text-xs text-slate-500 hover:text-slate-700"
      >
        <BarChart3 className="h-3.5 w-3.5 mr-1" />
        {open ? <><ChevronUp className="h-3 w-3 mr-1" />Hide Stats</> : <><ChevronDown className="h-3 w-3 mr-1" />Edit Stats</>}
      </Button>

      {open && (
        <Card className="border-slate-200 bg-white shadow-sm mt-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-700 font-medium">Match Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="font-medium text-slate-400" />
              <div className="font-medium text-center text-blue-600">Home</div>
              <div className="font-medium text-center text-red-600">Away</div>
              {fields.map((f) => (
                <div key={f.key} className="contents">
                  <div className="text-slate-500 self-center">{f.label}</div>
                  <Input
                    type="number"
                    min="0"
                    value={String(stats[f.key].home)}
                    onChange={(e) => update(f.key, "home", e.target.value)}
                    className="h-7 text-xs text-center font-mono border-slate-200"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={String(stats[f.key].away)}
                    onChange={(e) => update(f.key, "away", e.target.value)}
                    className="h-7 text-xs text-center font-mono border-slate-200"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
