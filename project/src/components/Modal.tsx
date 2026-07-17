import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, subtitle, icon, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-lift animate-scale-in`}
      >
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-start gap-4">
          {icon && (
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
