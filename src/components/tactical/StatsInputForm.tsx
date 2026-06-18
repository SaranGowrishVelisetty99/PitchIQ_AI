"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TacticalInput, MatchEvent, SampleMatch } from "../../../types";

interface StatsInputFormProps {
  onAnalyze: (input: TacticalInput) => void;
  loading: boolean;
  sampleMatches: SampleMatch[];
}

export function StatsInputForm({ onAnalyze, loading, sampleMatches }: StatsInputFormProps) {
  const [homeTeam, setHomeTeam] = useState("Argentina");
  const [awayTeam, setAwayTeam] = useState("France");
  const [homeFormation, setHomeFormation] = useState("4-4-2");
  const [awayFormation, setAwayFormation] = useState("4-2-3-1");
  const [eventsText, setEventsText] = useState("");
  const [possessionHome, setPossessionHome] = useState("54");

  const loadSample = (match: SampleMatch) => {
    setHomeTeam(match.homeTeam);
    setAwayTeam(match.awayTeam);
    setHomeFormation(match.formations.home);
    setAwayFormation(match.formations.away);
    setPossessionHome(match.stats.possession.home.toString());
    setEventsText(
      match.events
        .map(
          (e) =>
            `${e.minute}' - ${e.team === "home" ? match.homeTeam : match.awayTeam} ${e.type}${e.player ? ` (${e.player})` : ""}: ${e.description}`
        )
        .join("\n")
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventsText.trim()) return;

    const parsedEvents: (MatchEvent | null)[] = eventsText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const m = line.match(
          /(\d+)'\s*-\s*(.+?)\s+(goal|card|substitution|shot|corner|foul|missed-penalty)(?:\s+\((.+?)\))?:\s*(.+)/
        );
        if (!m) return null;
        const [, minute, teamName, type, player, description] = m;
        return {
          minute: parseInt(minute),
          type: type as MatchEvent["type"],
          team: teamName.trim() === homeTeam ? "home" as const : "away" as const,
          player: player || undefined,
          description: description.trim(),
        };
      });

    const events: MatchEvent[] = parsedEvents.filter((e): e is MatchEvent => e !== null);

    onAnalyze({
      events,
      stats: {
        possession: { home: parseInt(possessionHome), away: 100 - parseInt(possessionHome) },
        shots: { home: 0, away: 0 },
        shotsOnTarget: { home: 0, away: 0 },
        passes: { home: 0, away: 0 },
        passAccuracy: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
      },
      homeTeam,
      awayTeam,
      formations: { home: homeFormation, away: awayFormation },
    });
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-slate-900">Match Input</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="custom" className="space-y-4">
          <TabsList className="bg-slate-100 border border-slate-200">
            <TabsTrigger value="custom" className="text-slate-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Custom Match
            </TabsTrigger>
            <TabsTrigger value="samples" className="text-slate-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Sample Matches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="samples" className="space-y-2">
            {sampleMatches.map((match) => (
              <Button
                key={match.id}
                variant="outline"
                onClick={() => loadSample(match)}
                className="w-full justify-start border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {match.homeTeam} vs {match.awayTeam}
              </Button>
            ))}
          </TabsContent>

          <TabsContent value="custom">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Home Team</Label>
                  <Input
                    value={homeTeam}
                    onChange={(e) => setHomeTeam(e.target.value)}
                    className="border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Away Team</Label>
                  <Input
                    value={awayTeam}
                    onChange={(e) => setAwayTeam(e.target.value)}
                    className="border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600">Home Formation</Label>
                  <Input
                    value={homeFormation}
                    onChange={(e) => setHomeFormation(e.target.value)}
                    className="border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600">Away Formation</Label>
                  <Input
                    value={awayFormation}
                    onChange={(e) => setAwayFormation(e.target.value)}
                    className="border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600">Home Possession (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={possessionHome}
                  onChange={(e) => setPossessionHome(e.target.value)}
                  className="border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600">
                  Match Events (one per line: &quot;minute - team type (player): description&quot;)
                </Label>
                <Textarea
                  placeholder={`23' - Argentina goal (Messi): Penalty converted\n80' - France goal (Mbappé): Quick counter-attack`}
                  value={eventsText}
                  onChange={(e) => setEventsText(e.target.value)}
                  className="min-h-[120px] border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-mono text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !eventsText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
              >
                {loading ? "Analyzing Tactics..." : "Analyze Match"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
