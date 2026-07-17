import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Download, RotateCcw } from 'lucide-react';
import { downloadBytes, downloadBlob, formatBytes } from '../lib/pdf';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-card hover:shadow-lift hover:brightness-105',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2 rounded-lg gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-xl gap-2',
};

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export interface ResultFile {
  filename: string;
  bytes?: Uint8Array;
  blob?: Blob;
}

export function ResultCard({
  results,
  onReset,
  message,
}: {
  results: ResultFile[];
  onReset?: () => void;
  message?: string;
}) {
  const [downloaded, setDownloaded] = useState(false);
  const totalSize = results.reduce((s, r) => s + (r.bytes?.byteLength ?? r.blob?.size ?? 0), 0);

  const handleDownload = () => {
    results.forEach((r) => {
      if (r.bytes) downloadBytes(r.bytes, r.filename);
      else if (r.blob) downloadBlob(r.blob, r.filename);
    });
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6 text-center animate-scale-in">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-slate-900">Ready to download</h3>
      <p className="text-sm text-slate-600 mt-1">
        {message ?? `Your file${results.length > 1 ? `s (${results.length})` : ''} ${results.length > 1 ? 'are' : 'is'} ready.`}
      </p>
      {totalSize > 0 && <p className="text-xs text-slate-400 mt-1">{formatBytes(totalSize)}</p>}

      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={handleDownload} size="lg">
          {downloaded ? <CheckCircle2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
          {downloaded ? 'Downloaded!' : results.length > 1 ? 'Download all' : 'Download'}
        </Button>
        {onReset && (
          <Button variant="secondary" size="lg" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
            Start over
          </Button>
        )}
      </div>

      {results.length > 1 && (
        <div className="mt-4 max-h-40 overflow-y-auto text-left bg-white/60 rounded-xl p-2 space-y-1">
          {results.map((r) => (
            <div key={r.filename} className="flex items-center gap-2 text-xs text-slate-600 px-2 py-1">
              <Download className="w-3 h-3 text-slate-400" />
              <span className="truncate">{r.filename}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ErrorCard({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 animate-scale-in">
      <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-rose-700">Something went wrong</p>
        <p className="text-sm text-rose-600 mt-0.5">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-rose-400 hover:text-rose-600 text-sm font-medium">
          Dismiss
        </button>
      )}
    </div>
  );
}

export function ProgressDots({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span>Processing…</span>
        <span className="font-semibold text-brand-600">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
