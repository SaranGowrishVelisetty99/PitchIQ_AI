import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatConfidence(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "High", color: "text-emerald-400" };
  if (score >= 70) return { label: "Medium", color: "text-amber-400" };
  return { label: "Low", color: "text-red-400" };
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
