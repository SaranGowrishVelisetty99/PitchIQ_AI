"""Base Pydantic schemas mirroring types/index.ts."""

from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────────

class AgentName(str, Enum):
    formation = "formation"
    momentum = "momentum"
    var = "var"
    story = "story"
    explanation = "explanation"


class MatchTeam(str, Enum):
    home = "home"
    away = "away"


class IncidentType(str, Enum):
    offside = "offside"
    handball = "handball"
    penalty = "penalty"
    red_card = "red-card"
    general = "general"


class MatchEventType(str, Enum):
    goal = "goal"
    card = "card"
    substitution = "substitution"
    shot = "shot"
    corner = "corner"
    foul = "foul"
    missed_penalty = "missed-penalty"
    penalty = "penalty"


class ExpertiseLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    expert = "expert"
    child = "child"


class Impact(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


# ── Data models ────────────────────────────────────────────────────────────

class SourceCitation(BaseModel):
    title: str = ""
    section: str = ""
    similarity: float = 0.0
    excerpt: str = ""


class ExplainableResponse(BaseModel):
    summary: str = ""
    reasoning: str = ""
    evidence: list[str] = []
    confidence: float = 0.0
    sources: list[SourceCitation] = []


class VARIncident(BaseModel):
    type: IncidentType = IncidentType.general
    description: str = ""
    context: Optional[str] = None


class MatchEvent(BaseModel):
    minute: int
    type: MatchEventType
    team: MatchTeam
    player: Optional[str] = None
    description: str = ""


class TeamStats(BaseModel):
    home: float = 0.0
    away: float = 0.0


class MatchStats(BaseModel):
    possession: TeamStats = Field(default_factory=TeamStats)
    shots: TeamStats = Field(default_factory=TeamStats)
    shots_on_target: TeamStats = Field(default_factory=TeamStats)
    passes: TeamStats = Field(default_factory=TeamStats)
    pass_accuracy: TeamStats = Field(default_factory=TeamStats)
    fouls: TeamStats = Field(default_factory=TeamStats)
    corners: TeamStats = Field(default_factory=TeamStats)


class TacticalInput(BaseModel):
    events: list[MatchEvent] = []
    stats: MatchStats = Field(default_factory=MatchStats)
    home_team: str = ""
    away_team: str = ""
    formations: Optional[dict[str, str]] = None


class TurningPoint(BaseModel):
    minute: int
    description: str = ""
    impact: Impact = Impact.medium
    team: MatchTeam = MatchTeam.home


class AgentInput(BaseModel):
    message: str = ""
    match_data: Optional[TacticalInput] = None
    incident: Optional[VARIncident] = None
    expertise_level: ExpertiseLevel = ExpertiseLevel.intermediate
    history: list[ChatMessage] = []
    agent_names: list[AgentName] = Field(default_factory=list)


class AgentOutput(BaseModel):
    agent: AgentName
    output: dict[str, Any] = Field(default_factory=dict)
    confidence: float = 0.0
    reasoning: str = ""
    sources: list[SourceCitation] = []


class ChatMessage(BaseModel):
    id: str = ""
    role: str = "user"
    content: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    expertise_level: Optional[ExpertiseLevel] = None
    sources: list[SourceCitation] = []
    confidence: Optional[float] = None


# ── Agent-specific result models ──────────────────────────────────────────

class FormationTimelineEntry(BaseModel):
    period: dict[str, int]  # {start, end}
    home_formation: str = ""
    away_formation: str = ""
    trigger: str = ""
    description: str = ""


class FormationResult(BaseModel):
    formation_timeline: list[FormationTimelineEntry] = []
    tactical_insights: list[str] = []
    pressing_structure: str = ""
    defensive_block: str = ""
    attacking_pattern: str = ""
    confidence: float = 0.0


class MomentumDataPoint(BaseModel):
    minute: int
    home_value: float = 0.0
    away_value: float = 0.0
    trigger: Optional[str] = None


class ShiftExplanation(BaseModel):
    minute: int
    explanation: str = ""
    team: MatchTeam = MatchTeam.home


class DominantPeriod(BaseModel):
    team: MatchTeam = MatchTeam.home
    start: int = 0
    end: int = 90
    reason: str = ""


class MomentumResult(BaseModel):
    graph_data: list[MomentumDataPoint] = []
    shift_explanations: list[ShiftExplanation] = []
    dominant_periods: list[DominantPeriod] = []
    confidence: float = 0.0


class ApplicableLaw(BaseModel):
    law: str = ""
    section: str = ""
    relevance: str = ""


class VARAgentResult(BaseModel):
    decision: str = ""
    applicable_laws: list[ApplicableLaw] = []
    reasoning: str = ""
    fan_friendly: str = ""
    confidence: float = 0.0


class Chapter(BaseModel):
    title: str = ""
    content: str = ""
    minute_range: str = ""
    emotion: str = "calm"


class KeyMoment(BaseModel):
    minute: int
    description: str = ""
    significance: str = ""


class StoryAgentResult(BaseModel):
    narrative: str = ""
    chapters: list[Chapter] = []
    key_moments: list[KeyMoment] = []
    emotional_highlights: list[str] = []
    confidence: float = 0.0


class KeyTerm(BaseModel):
    term: str = ""
    simplified: str = ""


class ExplanationResult(BaseModel):
    original: str = ""
    explanation: str = ""
    mode: ExpertiseLevel = ExpertiseLevel.intermediate
    reading_difficulty_score: float = 5.0
    key_terms: list[KeyTerm] = []


# ── Orchestrated response ─────────────────────────────────────────────────

class OrchestratedResponse(BaseModel):
    query: str = ""
    primary_agent: AgentName = AgentName.formation
    agents: list[AgentOutput] = []
    combined: str = ""
    sources: list[SourceCitation] = []


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    expertise_level: ExpertiseLevel = ExpertiseLevel.intermediate
    context: Optional[str] = None


class SampleMatch(BaseModel):
    id: str = ""
    home_team: str = ""
    away_team: str = ""
    competition: str = ""
    formations: Optional[dict[str, str]] = None
    events: list[MatchEvent] = []
    stats: MatchStats = Field(default_factory=MatchStats)
