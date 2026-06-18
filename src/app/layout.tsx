import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BroadcastBar } from "@/components/layout/BroadcastBar";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { FanBar } from "@/components/layout/FanBar";
import { MatchProvider } from "@/contexts/MatchContext";
import { CommandPalette } from "@/components/common/CommandPalette";

const fontCommentary = Inter({
  variable: "--font-commentary",
  subsets: ["latin"],
  display: "swap",
});

const fontScoreboard = JetBrains_Mono({
  variable: "--font-scoreboard",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PitchIQ AI - Explainable Soccer Intelligence",
  description:
    "Understand soccer through explainable AI. VAR explanations, tactical analysis, match storytelling, and an AI soccer companion for fans.",
  icons: {
    icon: "/PitchIQ_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontCommentary.variable} ${fontScoreboard.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col bg-pitch-900 text-text-primary antialiased">
        <MatchProvider>
          <BroadcastBar />
          <LayoutShell>{children}</LayoutShell>
          <CommandPalette />
        </MatchProvider>
        <FanBar />
      </body>
    </html>
  );
}
