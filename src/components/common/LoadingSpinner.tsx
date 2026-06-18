import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Analyzing..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-gold-500/20" />
      </div>
      <p className="text-sm text-text-tertiary animate-pulse">{text}</p>
    </div>
  );
}
