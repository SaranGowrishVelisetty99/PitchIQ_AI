"use client";

import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { SourceCitationList } from "@/components/common/SourceCitation";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../../../types";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="overflow-x-auto my-2 -mx-1 max-w-full">
            <table className="w-max min-w-full text-xs border-collapse border border-pitch-700">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-pitch-700">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-pitch-700 px-3 py-1.5 text-left font-semibold text-text-primary">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-pitch-700 px-3 py-1.5 text-text-secondary">
            {children}
          </td>
        ),
        tr: ({ children }) => (
          <tr className="even:bg-pitch-800/50">{children}</tr>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-text-primary">{children}</strong>
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-pitch-700 px-1 py-0.5 rounded text-xs font-mono text-gold-500">
                {children}
              </code>
            );
          }
          return (
            <pre className="bg-pitch-800 border border-pitch-700 rounded-lg p-3 my-2 overflow-x-auto">
              <code className="text-xs font-mono text-text-secondary" {...props}>
                {children}
              </code>
            </pre>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-text-secondary">{children}</li>
        ),
        p: ({ children }) => (
          <p className="my-1.5 text-text-secondary last:mb-0">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-text-primary mt-3 mb-1.5">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-text-primary mt-2.5 mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-text-secondary mt-2 mb-0.5">{children}</h3>
        ),
        hr: () =>         <hr className="border-pitch-700 my-3" />,
        a: ({ href, children }) => (
          <a href={href} className="text-gold-500 hover:text-gold-400 underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-gold-500/30 pl-3 my-2 text-text-tertiary italic">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 px-1", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("h-7 w-7 shrink-0 mt-0.5 rounded-full flex items-center justify-center", isUser ? "bg-home" : "bg-pitch-700")}>
        {isUser ? <User className="h-3.5 w-3.5 text-white" /> : <Bot className="h-3.5 w-3.5 text-text-secondary" />}
      </div>

      <div className={cn("flex flex-col gap-1.5 max-w-[75%] min-w-0", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words min-w-0",
            isUser
              ? "bg-home text-white rounded-br-sm shadow-md shadow-home/20"
              : "bg-pitch-800 text-text-primary rounded-bl-sm border border-pitch-700 shadow-sm"
          )}
        >
          {isUser ? message.content : <MarkdownContent content={message.content} />}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-gold-500 animate-pulse rounded-sm align-middle" />
          )}
        </div>

        {!isUser && message.confidence !== undefined && (
          <div className="w-44 ml-1">
            <ConfidenceBadge score={message.confidence} />
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="ml-1 max-w-sm">
            <SourceCitationList sources={message.sources} />
          </div>
        )}
      </div>
    </div>
  );
}
