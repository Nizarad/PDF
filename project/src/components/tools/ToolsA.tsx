import { useState } from 'react';
import { InputPanel, OptionsPanel } from '../Panels';
import { Button, ResultCard, ErrorCard } from '../ui';
import type { ResultFile } from '../ui';
import { Modal } from '../Modal';
import type { Tool } from '../../lib/types';
import * as ops from '../../lib/operations';
import { parsePageRanges, getDocInfo, formatBytes } from '../../lib/pdf';

export interface ToolModalProps {
  tool: Tool;
  open: boolean;
  onClose: () => void;
}

/* ---------- MERGE ---------- */
export function MergeTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setPhase('processing');
    try {
      const bytes = await ops.mergePdfs(files);
      setResult([{ filename: 'merged.pdf', bytes }]);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to merge PDFs.');
      setPhase('error');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setPhase('input');
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel
          files={files}
          setFiles={setFiles}
          accept="application/pdf"
          multiple
          label="Drop PDF files to merge"
          hint="They will be combined in the order shown."
          icon={<tool.icon className="w-8 h-8" />}
          onNext={() => setPhase('options')}
        />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Merge PDFs">
          <div className="rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800">
            <p className="font-semibold mb-1">Order matters</p>
            <p className="text-brand-700">Reorder files with the arrows above. The merged PDF will follow this exact sequence.</p>
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Merging {files.length} PDFs…</p>
        </div>
      )}
      {phase === 'result' && result && (
        <ResultCard results={result} onReset={reset} message="Your merged PDF is ready." />
      )}
      {phase === 'error' && error && (
        <ErrorCard message={error} onDismiss={reset} />
      )}
    </Modal>
  );
}

/* ---------- SPLIT ---------- */
export function SplitTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [mode, setMode] = useState<'range' | 'each'>('range');
  const [ranges, setRanges] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = async () => {
    const info = await ops.loadPdf(files[0]);
    setTotalPages(info.numPages);
    setPhase('options');
  };

  const run = async () => {
    setBusy(true);
    setError(null);
    setPhase('processing');
    try {
      const res = await ops.splitPdf({ file: files[0], mode, ranges });
      setResult(res.map((r) => ({ filename: r.filename, bytes: r.bytes })));
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to split PDF.');
      setPhase('error');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFiles([]); setResult(null); setError(null); setPhase('input'); setRanges(''); setMode('range');
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to split" hint="One PDF file." icon={<tool.icon className="w-8 h-8" />} onNext={next} />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Split PDF" canRun={mode === 'each' || ranges.trim().length > 0}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Split mode</p>
              <div className="grid grid-cols-2 gap-2">
                {(['range', 'each'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      mode === m ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{m === 'range' ? 'Extract range' : 'Each page'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m === 'range' ? 'Pull specific pages into one PDF' : 'Create a PDF per page'}</p>
                  </button>
                ))}
              </div>
            </div>
            {mode === 'range' && (
              <div>
                <label className="text-sm font-semibold text-slate-700">Page ranges</label>
                <p className="text-xs text-slate-500 mb-2">Use commas and dashes. e.g. <code className="bg-slate-100 px-1 rounded">1-3, 5, 8-10</code>. This PDF has {totalPages} pages.</p>
                <input
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder="1-3, 5, 8-10"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                />
              </div>
            )}
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Splitting PDF…</p>
        </div>
      )}
      {phase === 'result' && result && (
        <ResultCard results={result} onReset={reset} message={result.length > 1 ? `${result.length} PDFs created.` : 'Your extracted PDF is ready.'} />
      )}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

/* ---------- ROTATE ---------- */
export function RotateTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setError(null); setPhase('processing');
    try {
      const bytes = await ops.rotatePdf(files[0], rotation);
      setResult([{ filename: files[0].name.replace(/\.pdf$/i, '') + '_rotated.pdf', bytes }]);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to rotate PDF.'); setPhase('error');
    } finally { setBusy(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setPhase('input'); };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to rotate" hint="One PDF file." icon={<tool.icon className="w-8 h-8" />} onNext={() => setPhase('options')} />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Rotate PDF">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Rotation angle</p>
            <div className="grid grid-cols-3 gap-2">
              {([90, 180, 270] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRotation(r)}
                  className={`rounded-xl border p-5 flex flex-col items-center gap-2 transition-all ${
                    rotation === r ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <tool.icon className={`w-6 h-6 ${rotation === r ? 'text-brand-600' : 'text-slate-400'}`} style={{ transform: `rotate(${r}deg)` }} />
                  <span className="text-sm font-semibold text-slate-700">{r}°</span>
                </button>
              ))}
            </div>
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <tool.icon className="w-10 h-10 text-brand-500 animate-spin" style={{ animationDuration: '2s' }} />
          <p className="text-sm text-slate-600">Rotating…</p>
        </div>
      )}
      {phase === 'result' && result && <ResultCard results={result} onReset={reset} />}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

type Phase = 'input' | 'options' | 'processing' | 'result' | 'error';

/* ---------- DELETE PAGES ---------- */
export function DeletePagesTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [ranges, setRanges] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = async () => {
    const info = await ops.loadPdf(files[0]);
    setTotalPages(info.numPages);
    setPhase('options');
  };

  const run = async () => {
    setBusy(true); setError(null); setPhase('processing');
    try {
      const pages = parsePageRanges(ranges, totalPages);
      if (pages.length === 0) throw new Error('No valid pages specified.');
      if (pages.length >= totalPages) throw new Error('You cannot delete every page.');
      const bytes = await ops.deletePages(files[0], pages);
      setResult([{ filename: files[0].name.replace(/\.pdf$/i, '') + '_trimmed.pdf', bytes }]);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete pages.'); setPhase('error');
    } finally { setBusy(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setPhase('input'); setRanges(''); };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to trim" hint="One PDF file." icon={<tool.icon className="w-8 h-8" />} onNext={next} />
      )}
      {phase === 'options' && (
        <OptionsPanel files={files} onRun={run} onBack={() => setPhase('input')} busy={busy} runLabel="Delete pages" canRun={ranges.trim().length > 0}>
          <div>
            <label className="text-sm font-semibold text-slate-700">Pages to delete</label>
            <p className="text-xs text-slate-500 mb-2">e.g. <code className="bg-slate-100 px-1 rounded">2, 5-7</code>. This PDF has {totalPages} pages.</p>
            <input
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder="2, 5-7"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
            />
            <p className="text-xs text-slate-400 mt-2">The remaining pages will be saved as a new PDF.</p>
          </div>
        </OptionsPanel>
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Deleting pages…</p>
        </div>
      )}
      {phase === 'result' && result && <ResultCard results={result} onReset={reset} />}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}

/* ---------- INFO ---------- */
export function InfoTool({ tool, open, onClose }: ToolModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('input');
  const [info, setInfo] = useState<Record<string, string | number | boolean | null> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = async () => {
    setError(null);
    setPhase('processing');
    try {
      const raw = await getDocInfo(files[0]);
      setInfo({
        'File name': files[0].name,
        'File size': formatBytes(raw.fileSize),
        'Pages': raw.numPages,
        'Page size': raw.firstPageSize ? `${Math.round(raw.firstPageSize.width)} × ${Math.round(raw.firstPageSize.height)} pt` : '—',
        'Title': raw.title || '—',
        'Author': raw.author || '—',
        'Subject': raw.subject || '—',
        'Creator': raw.creator || '—',
        'Producer': raw.producer || '—',
        'Encrypted': raw.encrypted ? 'Yes' : 'No',
      });
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read PDF.'); setPhase('error');
    }
  };

  const reset = () => { setFiles([]); setInfo(null); setError(null); setPhase('input'); };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={tool.name} subtitle={tool.description} icon={<tool.icon className="w-5 h-5" />} maxWidth="max-w-xl">
      {phase === 'input' && (
        <InputPanel files={files} setFiles={setFiles} accept="application/pdf" label="Drop a PDF to inspect" hint="One PDF file." icon={<tool.icon className="w-8 h-8" />} onNext={next} nextLabel="Inspect" />
      )}
      {phase === 'processing' && (
        <div className="py-12 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-600">Reading PDF metadata…</p>
        </div>
      )}
      {phase === 'result' && info && (
        <div className="space-y-2">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            {Object.entries(info).map(([k, v], i) => (
              <div key={k} className={`flex items-start justify-between gap-4 px-4 py-3 text-sm ${i % 2 ? 'bg-slate-50/60' : 'bg-white'}`}>
                <span className="text-slate-500 font-medium">{k}</span>
                <span className="text-slate-900 font-semibold text-right break-all">{String(v)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={reset}>Inspect another</Button>
          </div>
        </div>
      )}
      {phase === 'error' && error && <ErrorCard message={error} onDismiss={reset} />}
    </Modal>
  );
}
