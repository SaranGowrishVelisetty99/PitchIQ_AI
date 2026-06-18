export const stadiumColors = {
  pitch: {
    900: "#05150D",
    800: "#0A2416",
    700: "#0F341F",
    600: "#144528",
    500: "#1A5A33",
    400: "#227A3E",
    300: "#34A853",
  },
  gold: {
    50: "#FFF8E1",
    100: "#FFECB3",
    200: "#FFE082",
    300: "#FFD54F",
    400: "#FFE066",
    500: "#FFD700",
    600: "#E6C200",
    700: "#BFA000",
    800: "#997A00",
    900: "#735500",
    glow: "rgba(255, 215, 0, 0.4)",
    glowStrong: "rgba(255, 215, 0, 0.6)",
  },
  home: {
    primary: "#0066FF",
    light: "#E8F0FF",
    glow: "rgba(0, 102, 255, 0.3)",
    glowStrong: "rgba(0, 102, 255, 0.5)",
  },
  away: {
    primary: "#FF2D2D",
    light: "#FFE8E8",
    glow: "rgba(255, 45, 45, 0.3)",
    glowStrong: "rgba(255, 45, 45, 0.5)",
  },
  status: {
    goal: "#FFD700",
    var: "#FF6B00",
    momentum: "#00E676",
    cardYellow: "#FFB800",
    cardRed: "#E53935",
    xg: "#A855F7",
    injury: "#FF6B6B",
    substitution: "#4FC3F7",
  },
  surface: {
    glass: "rgba(10, 36, 22, 0.85)",
    glassBorder: "rgba(255, 215, 0, 0.12)",
    glassHover: "rgba(255, 215, 0, 0.2)",
    card: "#0F341F",
    cardHover: "#144528",
    elevated: "#1A5A33",
  },
  text: {
    primary: "#FAFAFA",
    secondary: "#D1D5DB",
    tertiary: "#9CA3AF",
    inverse: "#05150D",
    link: "#60A5FA",
  },
} as const;

export const typography = {
  display: {
    xl: { size: "clamp(3.5rem, 8vw, 6rem)", lineHeight: "1.05", weight: 800 },
    lg: { size: "clamp(2.5rem, 5vw, 4rem)", lineHeight: "1.1", weight: 800 },
    md: { size: "clamp(2rem, 4vw, 3rem)", lineHeight: "1.15", weight: 700 },
    sm: { size: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: "1.2", weight: 700 },
  },
  heading: {
    h1: { size: "clamp(2rem, 4vw, 3rem)", lineHeight: "1.2", weight: 700 },
    h2: { size: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: "1.3", weight: 600 },
    h3: { size: "clamp(1.25rem, 2.5vw, 1.75rem)", lineHeight: "1.35", weight: 600 },
    h4: { size: "clamp(1.125rem, 2vw, 1.5rem)", lineHeight: "1.4", weight: 600 },
  },
  body: {
    lg: { size: "1.125rem", lineHeight: "1.7", weight: 400 },
    md: { size: "1rem", lineHeight: "1.65", weight: 400 },
    sm: { size: "0.875rem", lineHeight: "1.6", weight: 400 },
    xs: { size: "0.8125rem", lineHeight: "1.55", weight: 400 },
  },
  ui: {
    label: { size: "0.75rem", lineHeight: "1.5", weight: 600 },
    caption: { size: "0.6875rem", lineHeight: "1.5", weight: 500 },
    micro: { size: "0.625rem", lineHeight: "1.4", weight: 500 },
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

export const containers = {
  narrow: "720px",
  standard: "1080px",
  wide: "1440px",
  full: "100%",
} as const;

export const breakpoints = {
  xs: "320px",
  sm: "480px",
  md: "768px",
  lg: "1024px",
  xl: "1440px",
  xxl: "1920px",
} as const;

export const motion = {
  duration: {
    instant: "50ms",
    fast: "150ms",
    base: "250ms",
    smooth: "350ms",
    slow: "500ms",
    cinematic: "800ms",
  },
  ease: {
    snap: "cubic-bezier(0.16, 1, 0.3, 1)",
    glide: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    dramatic: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
    entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  stagger: {
    tight: "30ms",
    base: "60ms",
    relaxed: "100ms",
  },
} as const;

export const radius = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  xxl: "32px",
  full: "9999px",
} as const;

export const shadows = {
  pitch: "0 4px 24px rgba(0, 0, 0, 0.4)",
  floodlight: "0 0 40px rgba(255, 215, 0, 0.4)",
  floodlightStrong: "0 0 80px rgba(255, 215, 0, 0.6)",
  card: "0 2px 16px rgba(0, 0, 0, 0.3)",
  cardHover: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.4)",
  inset: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  glowHome: "0 0 20px rgba(0, 102, 255, 0.3)",
  glowAway: "0 0 20px rgba(255, 45, 45, 0.3)",
} as const;

export type MatchStatus = "live" | "ft" | "ht" | "upcoming" | "suspended";
export type IncidentType = "offside" | "handball" | "penalty" | "red-card" | "general" | "goal" | "foul" | "substitution" | "injury" | "yellow-card";
export type TeamSide = "home" | "away";
export type AgentName = "formation" | "momentum" | "var" | "story" | "explanation";
export type ExpertiseLevel = "casual" | "analyst" | "pro" | "scout";

export function getStatusColor(status: MatchStatus): string {
  const map: Record<MatchStatus, string> = {
    live: stadiumColors.status.momentum,
    ft: stadiumColors.text.tertiary,
    ht: stadiumColors.gold[500],
    upcoming: stadiumColors.text.secondary,
    suspended: stadiumColors.status.var,
  };
  return map[status];
}

export function getIncidentColor(type: IncidentType): { bg: string; text: string; border: string } {
  const map: Record<IncidentType, { bg: string; text: string; border: string }> = {
    goal: { bg: "#FFD70020", text: "#FFD700", border: "#FFD70040" },
    offside: { bg: "#A855F720", text: "#A855F7", border: "#A855F740" },
    handball: { bg: "#FF6B0020", text: "#FF6B00", border: "#FF6B0040" },
    penalty: { bg: "#FF2D2D20", text: "#FF2D2D", border: "#FF2D2D40" },
    "red-card": { bg: "#E5393520", text: "#E53935", border: "#E5393540" },
    "yellow-card": { bg: "#FFB80020", text: "#FFB800", border: "#FFB80040" },
    foul: { bg: "#FF6B6B20", text: "#FF6B6B", border: "#FF6B6B40" },
    substitution: { bg: "#4FC3F720", text: "#4FC3F7", border: "#4FC3F740" },
    injury: { bg: "#FF6B6B20", text: "#FF6B6B", border: "#FF6B6B40" },
    general: { bg: "#9CA3AF20", text: "#9CA3AF", border: "#9CA3AF40" },
  };
  return map[type];
}
