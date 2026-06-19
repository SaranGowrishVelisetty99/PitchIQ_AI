"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="h-full bg-pitch-900 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pitch-800/80 text-text-secondary hover:text-text-primary hover:bg-pitch-700/80 transition-all text-sm border border-gold-500/10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <ChatWindow />
    </div>
  );
}
