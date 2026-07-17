import { useState, useCallback } from 'react';
import { InputPanel, OptionsPanel } from '../Panels';
import { Button, ResultCard, ErrorCard, ProgressDots } from '../ui';
import type { ResultFile } from '../ui';
import { Modal } from '../Modal';
import type { Tool } from '../../lib/types';
import * as ops from '../../lib/operations';
import { loadPdfjs, renderPageThumb, destroyDoc } from '../../lib/pdf';
import type { PageThumb } from '../../lib/types';

type Phase = 'input' | 'options' | 'processing' | 'result' | 'error';

export interface ToolModalProps {
  tool: Tool;
  open: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Slate', r: 0.15, g: 0.2, b: 0.3 },
  { name: 'Sky', r: 0.03, g: 0.4, b: 0.63 },
  { name: 'Rose', r: 0.8, g: 0.2, b: 0.3 },
  { name: 'Emerald', r: 0.05, g: 0.5, b: 0.35 },
  { name: 'Amber', r: 0.7, g: 0.45, b: 0.1 },
];

/* ---------- PAGE NUMBERS ---------- */
export function PageNumbersTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [position, setPosition] = useState<ops.PageNumberOptions['position']>('bottom-center');
  const [startAt, setStartAt] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [format, setFormat] = useState<ops.PageNumberOptions['format']>('n');
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null); setPhase('processing');
    try {
      const bytes = await ops.addPageNumbers({
        file: files[0], position, startAt, fontSize, format,
        color: { r: color.r, g: color.g, b: color.b },
      });
      setResult([{ filename: files[0].name.replace(/\.pdf$/i, '') + '_numbered.pdf', bytes }]);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add page numbers.'); setPhase('error');
    } finally { setBusy(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setPhase('input'); };

  const positions: { id: typeof position; label: string }[] = [
    { id: 'bottom-center', label: 'Bottom center' },
    { id: 'bottom-right', label: 'Bottom right' },
    { id: 'bottom-left', label: 'Bottom left' },
    { id: 'top-center', label: 'Top center' },
    { id: 'top-right', label: 'Top right' },
    { id: 'top-left', label: 'Top left' },
  ];

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to number" hint="One PDF file." icon={<tool.icon className="w-8 h-8" />} onNext={() => setPhase('options')} />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Add page numbers">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Position</p>
              <div className="grid grid-cols-3 gap-2">
                {positions.map((p) => (
                  <button key={p.id} onClick={() => setPosition(p.id)}
                    className={`rounded-lg border px-2 py-2.5 text-xs font-medium transition-all ${position === p.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Start at</label>
                <input type="number" min={1} value={startAt} onChange={(e) => setStartAt(Math.max(1, +e.target.value || 1))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Font size: {fontSize}pt</label>
                <input type="range" min={8} max={24} value={fontSize} onChange={(e) => setFontSize(+e.target.value)}
                  className="mt-3 w-full accent-brand-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Format</p>
              <div className="grid grid-cols-2 gap-2">
                {([['n', '1'], ['n-of-m', '1 / 10'], ['page-n', 'Page 1'], ['page-n-of-m', 'Page 1 of 10']] as const).map(([f, ex]) => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${format === f ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <span className="font-mono">{ex}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Color</p>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c.name} onClick={() => setColor(c)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all ${color.name === c.name ? 'ring-slate-400 scale-110' : 'ring-transparent'}`}
                    style={{ backgroundColor: `rgb(${c.r * 255}, ${c.g * 255}, ${c.b * 255})` }} />
                ))}
              </div>
            </div>
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Adding page numbers…</p>
        </div>
      )}
      {phase === 'result' && result && <ResultCard results={result} onReset={reset} />}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

/* ---------- WATERMARK ---------- */
export function WatermarkTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(45);
  const [tiled, setTiled] = useState(true);
  const [color, setColor] = useState(COLOR_PRESETS[3]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null); setPhase('processing');
    try {
      const bytes = await ops.addWatermark({
        file: files[0], text, fontSize, opacity, rotation, tiled,
        color: { r: color.r, g: color.g, b: color.b },
      });
      setResult([{ filename: files[0].name.replace(/\.pdf$/i, '') + '_watermarked.pdf', bytes }]);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add watermark.'); setPhase('error');
    } finally { setBusy(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setPhase('input'); };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to watermark" hint="One PDF file." icon={<tool.icon className="w-8 h-8" />} onNext={() => setPhase('options')} />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Add watermark" canRun={text.trim().length > 0}>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">Watermark text</label>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="CONFIDENTIAL"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Style</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTiled(true)} className={`rounded-lg border p-3 text-sm transition-all ${tiled ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>Tiled</button>
                <button onClick={() => setTiled(false)} className={`rounded-lg border p-3 text-sm transition-all ${!tiled ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>Single centered</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Size: {fontSize}pt</label>
                <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="mt-3 w-full accent-brand-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Opacity: {Math.round(opacity * 100)}%</label>
                <input type="range" min={5} max={80} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(+e.target.value / 100)} className="mt-3 w-full accent-brand-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Rotation: {rotation}°</label>
                <input type="range" min={0} max={90} value={rotation} onChange={(e) => setRotation(+e.target.value)} className="mt-3 w-full accent-brand-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Color</p>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c.name} onClick={() => setColor(c)} title={c.name}
                    className={`w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all ${color.name === c.name ? 'ring-slate-400 scale-110' : 'ring-transparent'}`}
                    style={{ backgroundColor: `rgb(${c.r * 255}, ${c.g * 255}, ${c.b * 255})` }} />
                ))}
              </div>
            </div>
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Adding watermark…</p>
        </div>
      )}
      {phase === 'result' && result && <ResultCard results={result} onReset={reset} />}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

/* ---------- IMAGES TO PDF ---------- */
export function ImagesToPdfTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null); setPhase('processing');
    try {
      const bytes = await ops.imagesToPdf(files, pageSize, orientation);
      setResult([{ filename: 'images.pdf', bytes }]);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to convert images.'); setPhase('error');
    } finally { setBusy(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setPhase('input'); };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="image/*" multiple label="Drop images to convert" hint="PNG, JPG, GIF, WebP — order matters." icon={<tool.icon className="w-8 h-8" />} onNext={() => setPhase('options')} />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Convert to PDF">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Page size</p>
              <div className="grid grid-cols-3 gap-2">
                {(['fit', 'a4', 'letter'] as const).map((s) => (
                  <button key={s} onClick={() => setPageSize(s)}
                    className={`rounded-lg border px-2 py-2.5 text-sm font-medium capitalize transition-all ${pageSize === s ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {s === 'fit' ? 'Fit image' : s === 'a4' ? 'A4' : 'Letter'}
                  </button>
                ))}
              </div>
            </div>
            {pageSize !== 'fit' && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Orientation</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['portrait', 'landscape'] as const).map((o) => (
                    <button key={o} onClick={() => setOrientation(o)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-all ${orientation === o ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Converting {files.length} images…</p>
        </div>
      )}
      {phase === 'result' && result && <ResultCard results={result} onReset={reset} />}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

/* ---------- PDF TO IMAGES ---------- */
export function PdfToImagesTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [scale, setScale] = useState(2);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null); setPhase('processing'); setProgress({ done: 0, total: 0 });
    try {
      const res = await ops.pdfToImages(files[0], scale, (done, total) => setProgress({ done, total }));
      setResult(res.map((r) => ({ filename: r.filename, blob: r.blob })));
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to render images.'); setPhase('error');
    } finally { setBusy(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setPhase('input'); setProgress({ done: 0, total: 0 }); };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to convert" hint="Each page becomes a PNG." icon={<tool.icon className="w-8 h-8" />} onNext={() => setPhase('options')} />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Convert to images">
          <div>
            <label className="text-sm font-semibold text-slate-700">Resolution: {scale}×</label>
            <p className="text-xs text-slate-500 mb-2">Higher = sharper but larger files.</p>
            <div className="grid grid-cols-3 gap-2">
              {([[1, 'Draft'], [2, 'Standard'], [3, 'High']] as const).map(([s, label]) => (
                <button key={s} onClick={() => setScale(s)}
                  className={`rounded-lg border px-2 py-3 text-sm transition-all ${scale === s ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs text-slate-400">{s}×</div>
                </button>
              ))}
            </div>
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-10 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
            <p className="text-sm text-slate-600">Rendering pages…</p>
          </div>
          {progress.total > 0 && <ProgressDots done={progress.done} total={progress.total} />}
        </div>
      )}
      {phase === 'result' && result && <ResultCard results={result} onReset={reset} message={`${result.length} images rendered.`} />}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

/* ---------- EXTRACT TEXT ---------- */
export function ExtractTextTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setError(null); setPhase('processing');
    try {
      const res = await ops.extractText(files[0]);
      setText(res.text);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to extract text.'); setPhase('error');
    }
  };

  const reset = () => { setFiles([]); setText(''); setError(null); setPhase('input'); setCopied(false); };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = files[0].name.replace(/\.pdf$/i, '') + '.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-2xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to extract text from" hint="Works best on text-based PDFs (not scans)." icon={<tool.icon className="w-8 h-8" />} onNext={run} nextLabel="Extract text" />
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Extracting text…</p>
        </div>
      )}
      {phase === 'result' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-500">{text.length.toLocaleString()} characters extracted</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</Button>
              <Button size="sm" variant="secondary" onClick={download}>Download .txt</Button>
              <Button size="sm" variant="ghost" onClick={reset}>New file</Button>
            </div>
          </div>
          <textarea
            value={text}
            readOnly
            className="w-full h-72 rounded-xl border border-slate-200 p-4 text-sm font-mono text-slate-700 bg-slate-50/50 focus:outline-none resize-y"
            placeholder="No text could be extracted. This PDF may be scanned images."
          />
          {text.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
              No selectable text found. This PDF likely contains scanned images rather than text. Use an OCR tool for those.
            </p>
          )}
        </div>
      )}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

/* ---------- COMPRESS ---------- */
export function CompressTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [level, setLevel] = useState<'light' | 'medium' | 'strong'>('medium');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [stats, setStats] = useState<{ original: number; compressed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null); setPhase('processing'); setProgress({ done: 0, total: 0 });
    const cfg = level === 'light' ? { scale: 2, quality: 0.85 } : level === 'medium' ? { scale: 1.5, quality: 0.7 } : { scale: 1, quality: 0.5 };
    try {
      const res = await ops.compressPdf(files[0], cfg.scale, cfg.quality, (done, total) => setProgress({ done, total }));
      setResult([{ filename: files[0].name.replace(/\.pdf$/i, '') + '_compressed.pdf', bytes: res.bytes }]);
      setStats({ original: res.originalSize, compressed: res.newSize });
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compress PDF.'); setPhase('error');
    } finally { setBusy(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setStats(null); setPhase('input'); setProgress({ done: 0, total: 0 }); };

  const savings = stats ? Math.max(0, Math.round((1 - stats.compressed / stats.original) * 100)) : 0;

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to compress" hint="One PDF file." icon={<tool.icon className="w-8 h-8" />} onNext={() => setPhase('options')} />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Compress PDF">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Compression level</p>
            <div className="grid grid-cols-3 gap-2">
              {([['light', 'Less', 'Best quality'], ['medium', 'Balanced', 'Recommended'], ['strong', 'More', 'Smallest size']] as const).map(([l, t, d]) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`rounded-xl border p-4 text-center transition-all ${level === l ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="text-sm font-bold text-slate-800">{t}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{d}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">Compression rasterizes pages — best for image-heavy PDFs. Text remains searchable visually.</p>
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-10 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
            <p className="text-sm text-slate-600">Compressing…</p>
          </div>
          {progress.total > 0 && <ProgressDots done={progress.done} total={progress.total} />}
        </div>
      )}
      {phase === 'result' && result && stats && (
        <div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-100 p-5 mb-4 text-center">
            <p className="text-4xl font-display font-extrabold text-brand-600">{savings}%</p>
            <p className="text-sm text-slate-600 mt-1">smaller</p>
            <div className="flex justify-center gap-6 mt-3 text-xs">
              <div><span className="text-slate-400">Before</span><br /><span className="font-semibold text-slate-700">{(stats.original / 1024 / 1024).toFixed(2)} MB</span></div>
              <div className="w-px bg-slate-200" />
              <div><span className="text-slate-400">After</span><br /><span className="font-semibold text-slate-700">{(stats.compressed / 1024 / 1024).toFixed(2)} MB</span></div>
            </div>
          </div>
          <ResultCard results={result} onReset={reset} />
        </div>
      )}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

/* ---------- REORDER (visual) ---------- */
export function ReorderTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [thumbs, setThumbs] = useState<PageThumb[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [rotations, setRotations] = useState<Record<number, 90 | 180 | 270>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadThumbs = useCallback(async () => {
    setLoading(true);
    try {
      const doc = await loadPdfjs(files[0]);
      const ts: PageThumb[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const r = await renderPageThumb(page, 180);
        ts.push({ index: i, dataUrl: r.dataUrl, width: r.width, height: r.height });
        page.cleanup();
      }
      setThumbs(ts);
      setOrder(ts.map((t) => t.index));
      await destroyDoc(doc);
      setPhase('options');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pages.');
      setPhase('error');
    } finally {
      setLoading(false);
    }
  }, [files]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const copy = [...order];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    setOrder(copy);
  };

  const remove = (pos: number) => {
    if (order.length === 1) return;
    setOrder(order.filter((_, i) => i !== pos));
  };

  const rotate = (pageIdx: number) => {
    setRotations((r) => ({ ...r, [pageIdx]: (((r[pageIdx] ?? 0) + 90) % 360) as 90 | 180 | 270 }));
  };

  const run = async () => {
    setBusy(true); setError(null); setPhase('processing');
    try {
      const bytes = await ops.reorderPdf(files[0], { order, rotations });
      setResult([{ filename: files[0].name.replace(/\.pdf$/i, '') + '_reordered.pdf', bytes }]);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reorder pages.'); setPhase('error');
    } finally { setBusy(false); }
  };

  const reset = () => {
    setFiles([]); setThumbs([]); setOrder([]); setRotations({});
    setResult(null); setError(null); setPhase('input'); setDragIndex(null);
  };

  const thumbByIndex = (idx: number) => thumbs.find((t) => t.index === idx);

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-4xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to rearrange" hint="Visual page organizer." icon={<tool.icon className="w-8 h-8" />} onNext={loadThumbs} nextLabel="Load pages" />
      )}
      {phase === 'options' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{order.length} pages · drag to reorder, use the controls on each page</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPhase('input')}>Back</Button>
              <Button size="sm" onClick={run} loading={busy}>Save reorder</Button>
            </div>
          </div>
          {loading && (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
              <p className="text-sm text-slate-500">Rendering page thumbnails…</p>
            </div>
          )}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {order.map((idx, pos) => {
                const t = thumbByIndex(idx);
                const rot = rotations[idx] ?? 0;
                return (
                  <div
                    key={`${idx}-${pos}`}
                    draggable
                    onDragStart={() => setDragIndex(pos)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== pos) move(dragIndex, pos);
                      setDragIndex(null);
                    }}
                    className={`group relative bg-white rounded-xl border-2 p-2 transition-all cursor-grab active:cursor-grabbing ${dragIndex === pos ? 'border-brand-500 opacity-50' : 'border-slate-200 hover:border-brand-300 hover:shadow-card'}`}
                  >
                    <div className="absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {pos + 1}
                    </div>
                    {t && (
                      <div className="bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 120 }}>
                        <img src={t.dataUrl} alt={`Page ${idx}`} className="max-w-full max-h-32 transition-transform" style={{ transform: `rotate(${rot}deg)` }} />
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => rotate(idx)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50" title="Rotate">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>
                      </button>
                      <span className="text-[10px] text-slate-400 font-medium">p.{idx}</span>
                      <button onClick={() => remove(pos)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Building reordered PDF…</p>
        </div>
      )}
      {phase === 'result' && result && <ResultCard results={result} onReset={reset} />}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}
