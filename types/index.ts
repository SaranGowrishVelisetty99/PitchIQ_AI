export interface ExplainableResponse {
  summary: string;
  reasoning: string;
  evidence: string[];
  confidence: number;
  sources: SourceCitation[];
}

export interface SourceCitation {
  title: string;
  section: string;
  similarity: number;
  excerpt: string;
}

export type IncidentType = 'offside' | 'handball' | 'penalty' | 'red-card' | 'general';

export interface VARIncident {
  type: IncidentType;
  description: string;
  context?: string;
}

export interface VARResult extends ExplainableResponse {
  fifaLaw: string;
  lawSection: string;
  fanFriendly: string;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'card' | 'substitution' | 'shot' | 'corner' | 'foul' | 'missed-penalty' | 'penalty';
  team: 'home' | 'away';
  player?: string;
  description: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
  fouls: { home: number; away: number };
  corners: { home: number; away: number };
}

export interface TacticalInput {
  events: MatchEvent[];
  stats: MatchStats;
  homeTeam: string;
  awayTeam: string;
  formations?: { home: string; away: string };
}

export interface TurningPoint {
  minute: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
  team: 'home' | 'away';
}

export interface TacticalResult extends ExplainableResponse {
  tacticalSummary: string;
  momentumAnalysis: string;
  turningPoints: TurningPoint[];
  formationImpact: string;
  keyAdjustments: string[];
}

export interface StoryInput extends TacticalInput {}

export interface StorySection {
  title: string;
  content: string;
  minuteRange: string;
}

export interface StoryResult extends ExplainableResponse {
  narrative: string;
  sections: StorySection[];
  keyMoments: TurningPoint[];
  summary: string;
}

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert' | 'child';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  expertiseLevel?: ExpertiseLevel;
  sources?: SourceCitation[];
  confidence?: number;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  expertiseLevel: ExpertiseLevel;
  context?: 'var' | 'tactical' | 'general' | 'rules' | 'formation' | 'momentum' | 'story';
}

export interface SampleMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  formations: { home: string; away: string };
  events: MatchEvent[];
  stats: MatchStats;
}

export type AgentName = 'formation' | 'momentum' | 'var' | 'story' | 'explanation';

export interface AgentOutput<T = unknown> {
  agent: AgentName;
  output: T;
  confidence: number;
  reasoning: string;
  sources: SourceCitation[];
}

export interface AgentInput {
  message: string;
  matchData?: Partial<TacticalInput>;
  incident?: VARIncident;
  expertiseLevel?: ExpertiseLevel;
  history?: ChatMessage[];
}

export interface FormationTimelineEntry {
  period: { start: number; end: number };
  homeFormation: string;
  awayFormation: string;
  trigger: string;
  description: string;
}

export interface FormationResult {
  formationTimeline: FormationTimelineEntry[];
  tacticalInsights: string[];
  pressingStructure: string;
  defensiveBlock: string;
  attackingPattern: string;
  confidence: number;
}

export interface MomentumDataPoint {
  minute: number;
  homeValue: number;
  awayValue: number;
  trigger: string;
}

export interface MomentumResult {
  graphData: MomentumDataPoint[];
  shiftExplanations: { minute: number; explanation: string; team: 'home' | 'away' }[];
  dominantPeriods: { team: 'home' | 'away'; start: number; end: number; reason: string }[];
  confidence: number;
}

export interface VARAgentResult {
  decision: string;
  applicableLaws: { law: string; section: string; relevance: string }[];
  reasoning: string;
  fanFriendly: string;
  confidence: number;
}

export interface StoryAgentResult {
  narrative: string;
  chapters: { title: string; content: string; minuteRange: string; emotion: string }[];
  keyMoments: { minute: number; description: string; significance: string }[];
  emotionalHighlights: string[];
  confidence: number;
}

export interface ExplanationResult {
  original: string;
  explanation: string;
  mode: ExpertiseLevel;
  readingDifficultyScore: number;
  keyTerms: { term: string; simplified: string }[];
}

export interface OrchestratedResponse {
  query: string;
  primaryAgent: AgentName;
  agents: AgentOutput[];
  combined: string;
  sources: SourceCitation[];
}
