import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/PitchIQ_logo.png"
              alt="PitchIQ AI"
              width={32}
              height={32}
              className="object-contain rounded-full ring-2 ring-blue-500/20"
            />
            <span className="text-sm font-semibold text-slate-900">
              Pitch<span className="text-blue-600">IQ</span> AI
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Explainable Soccer Intelligence for Fans. Built with FIFA World Cup spirit.
          </p>
        </div>
      </div>
    </footer>
  );
}
