"use client";

import { useState, useCallback, useRef } from "react";
import { useMatch } from "@/contexts/MatchContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Trash2, GripVertical, Goal, ShieldAlert, Repeat, Crosshair,
  CornerRightUp, Swords, Ban, PenTool, ChevronDown, ChevronUp,
} from "lucide-react";
import type { MatchEvent } from "../../../types";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { value: "goal" as const, label: "Goal", icon: Goal, color: "text-green-600" },
  { value: "penalty" as const, label: "Penalty", icon: PenTool, color: "text-amber-600" },
  { value: "card" as const, label: "Card", icon: Ban, color: "text-red-600" },
  { value: "substitution" as const, label: "Substitution", icon: Repeat, color: "text-blue-600" },
  { value: "shot" as const, label: "Shot", icon: Crosshair, color: "text-slate-600" },
  { value: "corner" as const, label: "Corner", icon: CornerRightUp, color: "text-purple-600" },
  { value: "foul" as const, label: "Foul", icon: Swords, color: "text-orange-600" },
  { value: "missed-penalty" as const, label: "Missed Pen", icon: ShieldAlert, color: "text-rose-600" },
];

interface Props {
  compact?: boolean;
}

export function EventTimelineBuilder({ compact }: Props) {
  const { events, setEvents, homeTeam, awayTeam } = useMatch();
  const [showForm, setShowForm] = useState(false);
  const [minute, setMinute] = useState("0");
  const [type, setType] = useState<MatchEvent["type"]>("goal");
  const [team, setTeam] = useState<"home" | "away">("home");
  const [player, setPlayer] = useState("");
  const [description, setDescription] = useState("");
  const [rawPaste, setRawPaste] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addEvent = useCallback(() => {
    const m = parseInt(minute);
    if (isNaN(m) || m < 0 || m > 120) return;
    const newEvent: MatchEvent = {
      minute: m,
      type,
      team,
      player: player.trim() || undefined,
      description: description.trim() || `${type} event`,
    };
    setEvents([...events, newEvent].sort((a, b) => a.minute - b.minute));
    setDescription("");
    setPlayer("");
    inputRef.current?.focus();
  }, [minute, type, team, player, description, events, setEvents]);

  const removeEvent = useCallback((index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  }, [events, setEvents]);

  const parsePaste = useCallback(() => {
    const lines = rawPaste.split("\n").filter(Boolean);
    const parsed: MatchEvent[] = [];
    for (const line of lines) {
      const m = line.match(/(\d+)'\s*-\s*(.+?)\s+(goal|card|substitution|shot|corner|foul|missed-penalty|penalty)(?:\s+\((.+?)\))?:\s*(.+)/);
      if (m) {
        const teamName = m[2].trim();
        parsed.push({
          minute: parseInt(m[1]),
          type: m[3] as MatchEvent["type"],
          team: teamName === homeTeam ? "home" as const : teamName === awayTeam ? "away" as const : "home" as const,
          player: m[4] || undefined,
          description: m[5].trim(),
        });
      }
    }
    if (parsed.length > 0) {
      setEvents([...events, ...parsed].sort((a, b) => a.minute - b.minute));
      setRawPaste("");
      setShowPaste(false);
    }
  }, [rawPaste, events, setEvents, homeTeam, awayTeam]);

  const clearAll = useCallback(() => {
    setEvents([]);
  }, [setEvents]);

  const EventIcon = EVENT_TYPES.find((et) => et.value === type);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-slate-400"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </Button>
          <span className="text-xs font-medium text-slate-500">{events.length} event{events.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400" onClick={() => setShowPaste(!showPaste)}>
            Paste
          </Button>
          {events.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-red-400" onClick={clearAll}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Quick-add form */}
      {!collapsed && (
        <div className="space-y-2">
          <Card className="border border-dashed border-slate-200 bg-slate-50/50">
            <CardContent className={cn("p-2 space-y-2", compact ? "space-y-1.5" : "")}>
              {/* Type selector icons */}
              <div className={cn("flex flex-wrap gap-1", compact && "gap-0.5")}>
                {EVENT_TYPES.map((et) => (
                  <button
                    key={et.value}
                    onClick={() => setType(et.value)}
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-medium transition-colors",
                      type === et.value
                        ? "bg-amber-100 text-amber-800 shadow-sm"
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <et.icon className={cn("h-3 w-3", et.color)} />
                    <span className={cn(compact && "hidden")}>{et.label}</span>
                  </button>
                ))}
              </div>

              {/* Minute + Team + Player row */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="w-14 text-xs px-1.5 py-1 rounded border border-slate-200 bg-white text-slate-900 text-center font-mono"
                    placeholder="Min"
                  />
                  <span className="text-xs text-slate-400">&apos;</span>
                </div>
                <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
                  <button
                    onClick={() => setTeam("home")}
                    className={cn("px-2 py-0.5 text-[10px] font-medium rounded transition-colors", team === "home" ? "bg-blue-600 text-white" : "text-slate-500")}
                  >
                    {compact ? "H" : homeTeam || "Home"}
                  </button>
                  <button
                    onClick={() => setTeam("away")}
                    className={cn("px-2 py-0.5 text-[10px] font-medium rounded transition-colors", team === "away" ? "bg-red-600 text-white" : "text-slate-500")}
                  >
                    {compact ? "A" : awayTeam || "Away"}
                  </button>
                </div>
                <input
                  ref={inputRef}
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  className="flex-1 min-w-0 text-xs px-1.5 py-1 rounded border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                  placeholder="Player (optional)"
                  onKeyDown={(e) => e.key === "Enter" && (description ? null : addEvent())}
                />
                <Button onClick={addEvent} size="icon" className="h-7 w-7 shrink-0 bg-amber-600 hover:bg-amber-500 text-white">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Description (shown only when not compact) */}
              {!compact && (
                <div className="flex gap-2">
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex-1 text-xs px-1.5 py-1 rounded border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    placeholder="Description (e.g. Penalty converted)"
                    onKeyDown={(e) => e.key === "Enter" && addEvent()}
                  />
                </div>
              )}

              {/* Paste textarea */}
              {showPaste && (
                <div className="space-y-1">
                  <textarea
                    value={rawPaste}
                    onChange={(e) => setRawPaste(e.target.value)}
                    className="w-full h-20 text-[10px] px-1.5 py-1 rounded border border-slate-200 bg-white text-slate-900 font-mono placeholder:text-slate-400"
                    placeholder="Paste events in format: 23' - Argentina goal (Messi): Penalty converted"
                  />
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setShowPaste(false)}>Cancel</Button>
                    <Button size="sm" className="h-6 text-[10px] bg-amber-600 hover:bg-amber-500 text-white" onClick={parsePaste}>Parse Events</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event list */}
          {events.length > 0 && (
            <div className={cn("space-y-1", compact && "space-y-0.5")}>
              {events.map((event, i) => {
                const et = EVENT_TYPES.find((e) => e.value === event.type);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md border border-slate-100 bg-white group",
                      compact && "py-1"
                    )}
                  >
                    <GripVertical className="h-3 w-3 text-slate-300 cursor-grab shrink-0" />
                    <span className="text-[10px] font-mono text-slate-400 w-8 shrink-0">{event.minute}&apos;</span>
                    {et && <et.icon className={cn("h-3 w-3 shrink-0", et.color)} />}
                    <Badge variant="outline" className={cn(
                      "text-[9px] px-1 py-0 h-4 font-medium shrink-0",
                      event.team === "home" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-red-200 text-red-700 bg-red-50"
                    )}>
                      {event.team === "home" ? (homeTeam || "H") : (awayTeam || "A")}
                    </Badge>
                    {event.player && (
                      <span className="text-[10px] font-medium text-slate-700 truncate">{event.player}</span>
                    )}
                    <span className="text-[10px] text-slate-500 truncate flex-1">{event.description}</span>
                    <button
                      onClick={() => removeEvent(i)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {events.length === 0 && !showPaste && (
            <p className="text-[10px] text-slate-400 text-center py-2">No events yet. Add one above or paste events.</p>
          )}
        </div>
      )}
    </div>
  );
}
