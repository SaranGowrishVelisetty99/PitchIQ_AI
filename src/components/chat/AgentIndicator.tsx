"use client";

import { AgentAvatar } from "@/components/football/AgentAvatar";

interface AgentIndicatorProps {
  agents: string[];
  thinking?: boolean;
}

export function AgentIndicator({ agents, thinking = false }: AgentIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {agents.map((agent) => (
        <div key={agent} className="relative">
          <AgentAvatar
            name={agent}
            size="xs"
            thinking={thinking}
          />
        </div>
      ))}
    </div>
  );
}
