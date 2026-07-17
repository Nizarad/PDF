import { useState } from 'react';
import { TOOLS, CATEGORIES } from '../lib/tools';
import type { Tool, ToolId } from '../lib/types';
import { ArrowRight } from 'lucide-react';

const accentMap: Record<string, { bg: string; text: string; ring: string; hover: string }> = {
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'group-hover:ring-sky-200', hover: 'hover:border-sky-300' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'group-hover:ring-teal-200', hover: 'hover:border-teal-300' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'group-hover:ring-violet-200', hover: 'hover:border-violet-300' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'group-hover:ring-rose-200', hover: 'hover:border-rose-300' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'group-hover:ring-amber-200', hover: 'hover:border-amber-300' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'group-hover:ring-cyan-200', hover: 'hover:border-cyan-300' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'group-hover:ring-emerald-200', hover: 'hover:border-emerald-300' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'group-hover:ring-orange-200', hover: 'hover:border-orange-300' },
  fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', ring: 'group-hover:ring-fuchsia-200', hover: 'hover:border-fuchsia-300' },
  lime: { bg: 'bg-lime-50', text: 'text-lime-600', ring: 'group-hover:ring-lime-200', hover: 'hover:border-lime-300' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'group-hover:ring-blue-200', hover: 'hover:border-blue-300' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'group-hover:ring-slate-200', hover: 'hover:border-slate-300' },
};

export function ToolGrid({ onOpen }: { onOpen: (tool: Tool) => void }) {
  const [filter, setFilter] = useState<Tool['category'] | 'all'>('all');

  const visible = filter === 'all' ? TOOLS : TOOLS.filter((t) => t.category === filter);

  return (
    <section id="tools" className="py-20 sm:py-28 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">The toolkit</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
            Twelve tools, one tab
          </h2>
          <p className="mt-4 text-slate-600">
            Pick a tool, drop your file, and download the result. Everything runs locally on your machine.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>All tools</FilterBtn>
          {CATEGORIES.map((c) => (
            <FilterBtn key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </FilterBtn>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((tool, i) => {
            const a = accentMap[tool.accent] ?? accentMap.slate;
            return (
              <button
                key={tool.id}
                onClick={() => onOpen(tool)}
                style={{ animationDelay: `${i * 0.04}s` }}
                className={`group text-left bg-white rounded-2xl border border-slate-200 ${a.hover} p-5 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 ring-2 ring-transparent ${a.ring} animate-fade-in-up`}
              >
                <div className={`w-12 h-12 rounded-xl ${a.bg} ${a.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-base">{tool.name}</h3>
                <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">{tool.description}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-brand-600 transition-colors">
                  Open tool
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-slate-900 text-white shadow-card'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

export type { ToolId };
