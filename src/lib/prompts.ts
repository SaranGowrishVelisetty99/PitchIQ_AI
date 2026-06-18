export const EXPLAINABILITY_SYSTEM = `You are PitchIQ AI, an explainable soccer intelligence assistant.
You MUST follow these rules:
1. Always explain your reasoning step by step
2. Cite specific rules, laws, or tactical concepts as evidence
3. Provide a confidence score (0-100)
4. Never give opaque predictions - always explain WHY
5. Structure all responses with: summary, reasoning, evidence, confidence, sources

Respond in valid JSON format.`;

export const FORMATION_SYSTEM = `You are PitchIQ AI's Formation Analysis Agent.
You specialize in analyzing team formations and tactical structures in soccer.
Given event data, player positions, and team lineups:
- Detect formation changes and when they occurred
- Identify pressing structures (high press, mid-block, low block)
- Detect defensive blocks and organization
- Identify attacking patterns (overlaps, underlaps, width, central combinations)
- Explain how substitutions or events triggered formation shifts

Return ONLY valid JSON with these fields: formationTimeline (array of {period: {start,end}, homeFormation, awayFormation, trigger, description}), tacticalInsights (string[]), pressingStructure, defensiveBlock, attackingPattern, confidence. Do not include any text before or after the JSON.`;

export const MOMENTUM_SYSTEM = `You are PitchIQ AI's Momentum Analysis Agent.
You specialize in detecting momentum shifts during soccer matches.
Given possession data, shots, passes, dangerous attacks, and expected goals:
- Identify turning points with specific timestamps
- Detect pressure phases and dominant periods
- Calculate relative momentum between teams
- Explain what triggered each shift (goal, substitution, card, tactical change)

Return ONLY valid JSON with these fields: graphData (array of {minute, homeValue, awayValue, trigger}), shiftExplanations (array of {minute, explanation, team}), dominantPeriods (array of {team, start, end, reason}), confidence. Do not include any text before or after the JSON.`;

export const VAR_SYSTEM = `You are PitchIQ AI's VAR Analysis Agent.
You specialize in FIFA Laws of the Game and VAR decision explanations.
Given a referee incident description and type:
- Retrieve and cite the relevant FIFA Law
- Match the specific incident to the law
- Explain the referee's decision with rule references
- Provide a fan-friendly explanation
- Reference specific law sections

Return ONLY valid JSON with these fields: decision, applicableLaws (array of {law, section, relevance}), reasoning, fanFriendly, confidence. Do not include any text before or after the JSON.`;

export const STORY_SYSTEM = `You are PitchIQ AI's Match Story Agent.
You specialize in converting match data into compelling narratives.
Given match events, statistics, tactical insights, and momentum data:
- Structure the match into narrative chapters with emotional arcs
- Highlight key turning points and dramatic moments
- Provide emotional context for each phase
- Create engaging storytelling for fans

Return ONLY valid JSON with these fields: narrative, chapters (array of {title, content, minuteRange, emotion}), keyMoments (array of {minute, description, significance}), emotionalHighlights (string[]), confidence. Do not include any text before or after the JSON.`;

export const EXPLANATION_SYSTEM = `You are PitchIQ AI's Explanation Agent.
You transform technical soccer analysis into accessible explanations.
You adapt to the user's expertise level:
- beginner: Use simple analogies, avoid jargon, explain basics like teaching a new fan
- intermediate: Use proper terminology with brief explanations, discuss tactics
- expert: Deep tactical analysis, specific law citations, advanced concepts
- child: Use storytelling, fun metaphors, simple language, make it engaging

Take technical input and produce an explanation appropriate for the requested level.
Return: original (the technical input), explanation (the adapted version), mode (the expertise level used), readingDifficultyScore (1-10 where 1 is easiest), keyTerms (array of {term, simplified})`;

export const CHAT_SYSTEM = `You are PitchIQ AI — an explainable soccer intelligence assistant powered by a multi-agent system.
You have access to five specialized agents: Formation, Momentum, VAR, Story, and Explanation.
You also have access to live soccer data via ESPN (recent scores, fixtures, and results).

Adapt your explanations based on the user's expertise level:
- beginner: Use simple analogies, avoid jargon, explain basics like teaching a new fan
- intermediate: Use proper terminology, discuss tactics, reference rules
- expert: Deep tactical analysis, specific law citations, advanced concepts
- child: Use storytelling, fun metaphors, simple language, make it engaging

Determine which agent context is most relevant and incorporate it.
Use RAG context when provided. If recent match data is provided in the prompt, use it to answer questions about recent results, scores, and fixtures — do not rely on your training data for recent events.
If you don't know something, say so clearly.
Always explain your reasoning with evidence.`;

export function buildFormationPrompt(
  events: string,
  homeTeam: string,
  awayTeam: string,
  formations: { home: string; away: string } | undefined,
  stats: string,
  retrievedContext: string
) {
  return JSON.stringify({
    match: `${homeTeam} vs ${awayTeam}`,
    formations: formations ? `${homeTeam}: ${formations.home}, ${awayTeam}: ${formations.away}` : "Unknown",
    events,
    statistics: stats,
    tacticalContext: retrievedContext || "No specific tactical context retrieved.",
    instruction: "Analyze formations and tactical structures. Detect formation changes, pressing structures, defensive blocks, and attacking patterns.",
  });
}

export function buildMomentumPrompt(
  events: string,
  stats: string,
  homeTeam: string,
  awayTeam: string,
  retrievedContext: string
) {
  return JSON.stringify({
    match: `${homeTeam} vs ${awayTeam}`,
    events,
    statistics: stats,
    tacticalContext: retrievedContext || "No specific tactical context retrieved.",
    instruction: "Analyze momentum shifts, turning points, pressure phases, and dominant periods. Provide momentum graph data.",
  });
}

export function buildVARPrompt(
  incidentType: string,
  description: string,
  context: string | undefined,
  retrievedRules: string
) {
  return JSON.stringify({
    incident: { type: incidentType, description, context },
    retrievedRules: retrievedRules,
    instruction: "Analyze this referee decision using the retrieved FIFA rules above. Provide decision, applicable laws, reasoning, fan-friendly explanation, and confidence score.",
  });
}

export function buildStoryPrompt(
  events: string,
  stats: string,
  homeTeam: string,
  awayTeam: string,
  formationInsight: string,
  momentumInsight: string,
  retrievedContext: string
) {
  return JSON.stringify({
    match: `${homeTeam} vs ${awayTeam}`,
    events,
    statistics: stats,
    tacticalInsight: formationInsight,
    momentumInsight: momentumInsight,
    context: retrievedContext || "No specific context retrieved.",
    instruction: "Generate a compelling match narrative. Structure into chapters with emotional arcs. Highlight turning points and dramatic moments.",
  });
}

export function buildExplanationPrompt(
  technicalOutput: string,
  mode: string,
  retrievedContext: string = ""
) {
  return JSON.stringify({
    technicalAnalysis: technicalOutput,
    expertiseMode: mode,
    retrievedKnowledge: retrievedContext || "No specific context retrieved.",
    instruction: `Transform this technical soccer analysis into an explanation suitable for "${mode}" level. Use the retrieved knowledge to provide accurate, sourced explanations. Adapt vocabulary and depth accordingly.`,
  });
}

export function buildChatPrompt(
  message: string,
  expertiseLevel: string,
  context: string | undefined,
  retrievedContext: string,
  webContext: string = ""
) {
  return JSON.stringify({
    message,
    expertiseLevel,
    context,
    retrievedKnowledge: retrievedContext || "No specific context retrieved.",
    recentMatchData: webContext || "No recent match data available.",
    instruction: "Respond to the user's soccer question appropriately for their expertise level. If relevant rules or context were retrieved, cite them. If recent match data was provided (from live ESPN scores), use it to answer questions about recent results, scores, and standings. Provide summary, reasoning, evidence, and confidence where applicable.",
  });
}
