import { useCallback, useState, type ReactNode } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { formatBytes } from '../lib/pdf';

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  hint?: string;
  icon?: ReactNode;
}

export function FileDropzone({ accept, multiple, onFiles, label, hint, icon }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const all = Array.from(list);
      const filtered = accept.includes('pdf')
        ? all.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
        : all;
      onFiles(multiple ? filtered : [filtered[0]]);
    },
    [accept, multiple, onFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center cursor-pointer group ${
        dragging
          ? 'border-brand-500 bg-brand-50 scale-[1.01]'
          : 'border-slate-300 bg-slate-50/50 hover:border-brand-400 hover:bg-brand-50/40'
      }`}
      onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        if (multiple) input.multiple = true;
        input.onchange = () => handle(input.files);
        input.click();
      }}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragging
              ? 'bg-brand-500 text-white scale-110'
              : 'bg-white text-brand-600 shadow-soft group-hover:scale-105'
          }`}
        >
          {icon ?? <UploadCloud className="w-8 h-8" />}
        </div>
        <div>
          <p className="text-base font-semibold text-slate-800">{label}</p>
          {hint && <p className="text-sm text-slate-500 mt-1">{hint}</p>}
        </div>
        <span className="text-xs font-medium text-brand-600 bg-brand-100 px-3 py-1.5 rounded-full">
          Drop files or click to browse
        </span>
      </div>
    </div>
  );
}

interface FileChipProps {
  file: File;
  onRemove?: () => void;
  index?: number;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
}

export function FileChip({ file, onRemove, index, draggable, onDragStart, onDragOver, onDrop }: FileChipProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="group flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-soft hover:shadow-card transition-all"
    >
      {typeof index === 'number' && (
        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
      )}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
        <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 w-7 h-7 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors"
          aria-label="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
