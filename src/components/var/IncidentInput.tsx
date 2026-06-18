"use client";

import { useState } from "react";
import { MatchButton } from "@/components/design-system/MatchButton";
import { TacticalCard, TacticalCardHeader, TacticalCardTitle, TacticalCardContent } from "@/components/design-system/TacticalCard";
import { StadiumInput } from "@/components/design-system/StadiumInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncidentType } from "../../../types";

interface IncidentInputProps {
  onAnalyze: (type: IncidentType, description: string, context?: string) => void;
  loading: boolean;
}

export function IncidentInput({ onAnalyze, loading }: IncidentInputProps) {
  const [type, setType] = useState<IncidentType>("offside");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onAnalyze(type, description, context || undefined);
  };

  return (
    <TacticalCard variant="pitch">
      <TacticalCardHeader>
        <TacticalCardTitle>Describe the Incident</TacticalCardTitle>
      </TacticalCardHeader>
      <TacticalCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Incident Type
            </label>
            <Select value={type} onValueChange={(v) => setType(v as IncidentType)}>
              <SelectTrigger className="border-pitch-700 bg-pitch-800 text-text-primary">
                <SelectValue placeholder="Select incident type" />
              </SelectTrigger>
              <SelectContent className="border-pitch-700 bg-pitch-800 text-text-primary">
                <SelectItem value="offside">Offside</SelectItem>
                <SelectItem value="handball">Handball</SelectItem>
                <SelectItem value="penalty">Penalty Decision</SelectItem>
                <SelectItem value="red-card">Red Card</SelectItem>
                <SelectItem value="general">General Decision</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <StadiumInput
            label="Incident Description"
            placeholder="e.g., The attacker was ahead of the defender when the pass was played..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <StadiumInput
            label="Additional Context (optional)"
            placeholder="e.g., Minute 73, attacking player #10 involved"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />

          <MatchButton
            type="submit"
            variant="primary"
            className="bg-emerald-600 hover:bg-emerald-500"
            fullWidth
            disabled={loading || !description.trim()}
          >
            {loading ? "Analyzing..." : "Analyze Decision"}
          </MatchButton>
        </form>
      </TacticalCardContent>
    </TacticalCard>
  );
}
