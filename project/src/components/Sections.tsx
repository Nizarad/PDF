import { Shield, Cpu, Download, Heart } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Download,
      title: 'Drop your file',
      desc: 'Pick a tool and drag in your PDF or images. Nothing is uploaded — everything stays on your device.',
    },
    {
      icon: Cpu,
      title: 'Processed locally',
      desc: 'pdf-lib and PDF.js run in your browser via WebAssembly. Your files are never sent to a server.',
    },
    {
      icon: Shield,
      title: 'Download instantly',
      desc: 'Get your result file immediately. No queue, no email, no watermarks, no account required.',
    },
  ];

  return (
    <section id="how" className="py-20 sm:py-28 scroll-mt-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">How it works</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
            Three steps. Zero uploads.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="relative bg-white rounded-2xl border border-slate-200 p-7 shadow-soft">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center shadow-md">
                {i + 1}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 text-brand-600 flex items-center justify-center mb-4">
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PrivacyBanner() {
  return (
    <section id="privacy" className="py-20 sm:py-28 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 p-8 sm:p-12 text-white">
          <div className="absolute inset-0 dot-bg opacity-20" />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold text-brand-200 mb-5">
              <Shield className="w-3.5 h-3.5" />
              Privacy by design
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
              Your files never leave your device.
            </h2>
            <p className="mt-4 text-slate-300 text-lg max-w-2xl leading-relaxed">
              Unlike most online PDF services, PDFtastic performs every operation directly in your
              browser using WebAssembly. There is no server that receives, stores, or sees your
              documents — because there is no upload step at all.
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                ['No', 'uploads'],
                ['No', 'accounts'],
                ['No', 'watermarks'],
                ['No', 'tracking'],
              ].map(([big, small]) => (
                <div key={small} className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                  <div className="font-display text-2xl font-extrabold text-white">{big}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{small}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const faqs = [
    {
      q: 'Are my files really not uploaded?',
      a: 'Correct. Every tool runs entirely in your browser using pdf-lib and PDF.js compiled to WebAssembly. Your files are processed locally and never sent over the network.',
    },
    {
      q: 'Is it really free?',
      a: 'Yes. There are no subscriptions, no credits, and no hidden limits. We add nothing to your output files — no watermarks, no branding.',
    },
    {
      q: 'Which browsers are supported?',
      a: 'Any modern browser with WebAssembly support: Chrome, Edge, Firefox, Safari, and their mobile equivalents. No installation required.',
    },
    {
      q: 'Are scanned PDFs supported?',
      a: 'Editing and organizing scanned PDFs works great. Text extraction needs selectable text in the PDF — pure image scans require OCR, which is not included here.',
    },
    {
      q: 'Is there a file size limit?',
      a: 'Only the memory of your device. Because processing is local, large files are constrained by your available RAM rather than an arbitrary server cap.',
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 scroll-mt-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">FAQ</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
            Questions, answered
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between gap-4 cursor-pointer p-5 font-semibold text-slate-800 list-none">
                {f.q}
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
            </div>
            <span className="font-display text-base font-bold text-white">
              PDF<span className="text-brand-400">tastic</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-right">
            Built with pdf-lib &amp; PDF.js. Runs entirely in your browser.
            <br />
            Made with <Heart className="inline w-3 h-3 text-rose-400" /> for the open web.
          </p>
        </div>
      </div>
    </footer>
  );
}
