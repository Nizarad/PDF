import { Shield, Zap, Lock } from 'lucide-react';

export function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section id="top" className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 grid-bg opacity-60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/40 via-transparent to-transparent" />
      <div className="absolute top-20 -left-32 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl -z-10 animate-float" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-soft mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            100% private — files never leave your browser
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            Every PDF tool you need.
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent">
              Right in your browser.
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Merge, split, rotate, watermark, convert, compress and more — all powered by WebAssembly
            that runs entirely on your device. No uploads, no waiting, no sign-up.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <button
              onClick={onCta}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold px-7 py-3.5 rounded-xl shadow-card hover:shadow-lift hover:brightness-105 transition-all hover:-translate-y-0.5"
            >
              <Zap className="w-5 h-5" />
              Explore all tools
            </button>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-7 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              How it works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-500" /> No uploads</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Instant processing</span>
            <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-brand-500" /> No watermarks added</span>
            <span className="inline-flex items-center gap-1.5">Free forever</span>
          </div>
        </div>
      </div>
    </section>
  );
}
