import { useState, useEffect } from 'react';
import { FileText, Menu, X } from 'lucide-react';

export function Header({ onNavigateTools }: { onNavigateTools?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Tools', target: '#tools' },
    { label: 'How it works', target: '#how' },
    { label: 'Privacy', target: '#privacy' },
    { label: 'FAQ', target: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/85 backdrop-blur-lg border-b border-slate-200/70 shadow-soft' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-card group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
            PDF<span className="text-brand-600">tastic</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.target}
              href={l.target}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 rounded-lg hover:bg-brand-50/60 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onNavigateTools}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-card hover:shadow-lift hover:brightness-105 transition-all"
          >
            Open tools
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden w-9 h-9 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 animate-fade-in">
          {links.map((l) => (
            <a
              key={l.target}
              href={l.target}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setMenuOpen(false); onNavigateTools?.(); }}
            className="w-full mt-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            Open tools
          </button>
        </div>
      )}
    </header>
  );
}
