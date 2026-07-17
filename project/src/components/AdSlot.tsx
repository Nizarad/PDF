import { useState, useEffect } from 'react';

interface AdSlotProps {
  variant?: 'banner' | 'square' | 'native';
  className?: string;
}

const SIZES = {
  banner: { minHeight: 90, label: '728 × 90' },
  square: { minHeight: 250, label: '300 × 250' },
  native: { minHeight: 120, label: 'Responsive' },
};

export function AdSlot({ variant = 'banner', className = '' }: AdSlotProps) {
  const [visible, setVisible] = useState(true);
  const size = SIZES[variant];

  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <div
        className="relative w-full max-w-[728px] rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100/60 overflow-hidden group"
        style={{ minHeight: size.minHeight }}
        role="complementary"
        aria-label="Advertisement"
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute top-1.5 right-2 z-10 text-[10px] text-slate-400 hover:text-slate-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-200/60 transition-colors"
          aria-label="Dismiss ad"
        >
          ✕
        </button>
        <div className="absolute top-1.5 left-2 text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
          Advertisement
        </div>
        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
          <div className="w-10 h-10 rounded-xl bg-white shadow-soft flex items-center justify-center mb-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 10h18M8 5v14" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-500">Your ad here</p>
          <p className="text-xs text-slate-400 mt-0.5">{size.label} · supports this free tool</p>
        </div>
      </div>
    </div>
  );
}
