import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui';
import { FileDropzone, FileChip } from './FileDropzone';

export type Phase = 'input' | 'options' | 'processing' | 'result' | 'error';

interface PanelProps {
  files: File[];
  setFiles?: (f: File[]) => void;
  onRun: () => void;
  onBack: () => void;
  busy: boolean;
  // tool-specific extra UI
  children?: ReactNode;
  runLabel?: string;
  canRun?: boolean;
}

export function InputPanel({
  files,
  setFiles,
  accept,
  multiple,
  label,
  hint,
  icon,
  onNext,
  nextLabel = 'Continue',
}: {
  files: File[];
  setFiles: (f: File[]) => void;
  accept: string;
  multiple?: boolean;
  label: string;
  hint?: string;
  icon?: ReactNode;
  onNext: () => void;
  nextLabel?: string;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const copy = [...files];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    setFiles(copy);
  };

  return (
    <div className="space-y-5">
      {files.length === 0 ? (
        <FileDropzone
          accept={accept}
          multiple={multiple}
          onFiles={setFiles}
          label={label}
          hint={hint}
          icon={icon}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            <button
              onClick={() => setFiles([])}
              className="text-xs font-medium text-slate-500 hover:text-rose-500"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                {multiple && files.length > 1 && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      className="text-slate-300 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <button
                      onClick={() => move(i, i + 1)}
                      disabled={i === files.length - 1}
                      className="text-slate-300 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <FileChip file={f} index={multiple ? i : undefined} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = accept;
              if (multiple) input.multiple = true;
              input.onchange = () => {
                if (input.files) setFiles([...files, ...Array.from(input.files)]);
              };
              input.click();
            }}
          >
            + Add more
          </Button>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex justify-end pt-2">
          <Button onClick={onNext} size="lg">
            {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function OptionsPanel({
  files,
  children,
  onRun,
  onBack,
  busy,
  runLabel = 'Run tool',
  canRun = true,
}: PanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
        <span className="font-semibold text-slate-600">{files.length} file{files.length > 1 ? 's' : ''}</span>
        <span>·</span>
        {files.slice(0, 3).map((f) => (
          <span key={f.name} className="truncate max-w-[160px]">{f.name}</span>
        ))}
        {files.length > 3 && <span>+{files.length - 3} more</span>}
      </div>
      {children}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" size="md" onClick={onBack} disabled={busy}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onRun} size="lg" loading={busy} disabled={!canRun}>
          {runLabel}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function useAsyncTool() {
  const [phase, setPhase] = useState<Phase>('input');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(msg);
      setPhase('error');
    } finally {
      setBusy(false);
    }
  };

  return { phase, setPhase, busy, error, setError, run };
}
