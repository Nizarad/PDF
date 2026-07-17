import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';
import { HowItWorks, PrivacyBanner, FAQ, Footer } from './components/Sections';
import { AdSlot } from './components/AdSlot';
import type { Tool, ToolId } from './lib/types';
import {
  MergeTool,
  SplitTool,
  RotateTool,
  DeletePagesTool,
  InfoTool,
} from './components/tools/ToolsA';
import {
  PageNumbersTool,
  WatermarkTool,
  ImagesToPdfTool,
  PdfToImagesTool,
  ExtractTextTool,
  CompressTool,
  ReorderTool,
} from './components/tools/ToolsB';

function App() {
  const [active, setActive] = useState<Tool | null>(null);

  const openTool = useCallback((tool: Tool) => setActive(tool), []);
  const closeTool = useCallback(() => setActive(null), []);

  const scrollToTools = useCallback(() => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const renderTool = (id: ToolId) => {
    const tool = active!;
    const props = { tool, open: true, onClose: closeTool };
    switch (id) {
      case 'merge': return <MergeTool {...props} />;
      case 'split': return <SplitTool {...props} />;
      case 'rotate': return <RotateTool {...props} />;
      case 'delete-pages': return <DeletePagesTool {...props} />;
      case 'info': return <InfoTool {...props} />;
      case 'page-numbers': return <PageNumbersTool {...props} />;
      case 'watermark': return <WatermarkTool {...props} />;
      case 'images-to-pdf': return <ImagesToPdfTool {...props} />;
      case 'pdf-to-images': return <PdfToImagesTool {...props} />;
      case 'extract-text': return <ExtractTextTool {...props} />;
      case 'compress': return <CompressTool {...props} />;
      case 'reorder': return <ReorderTool {...props} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onNavigateTools={scrollToTools} />
      <main>
        <Hero onCta={scrollToTools} />
        <ToolGrid onOpen={openTool} />
        <AdSlot variant="banner" className="-mt-6 mb-4 px-4" />
        <HowItWorks />
        <AdSlot variant="banner" className="my-4 px-4" />
        <PrivacyBanner />
        <FAQ />
        <AdSlot variant="native" className="mt-4 mb-8 px-4" />
      </main>
      <Footer />

      {active && renderTool(active.id)}
    </div>
  );
}

export default App;
