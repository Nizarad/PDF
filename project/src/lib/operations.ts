import {
  PDFDocument,
  degrees,
  rgb,
  StandardFonts,
  loadPdfjs,
  renderPageToCanvas,
  canvasToBlob,
  blobToArrayBuffer,
  embedImage,
  fileToImageEmbed,
  destroyDoc,
  parsePageRanges,
  replaceExtension,
} from './pdf';
import type { LoadedPdf } from './types';

export interface MergeOptions {
  files: File[];
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const p of pages) out.addPage(p);
  }
  return await out.save();
}

export interface SplitOptions {
  file: File;
  mode: 'range' | 'each';
  ranges: string;
}

export async function splitPdf(
  opts: SplitOptions,
): Promise<{ filename: string; bytes: Uint8Array }[]> {
  const bytes = await opts.file.arrayBuffer();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = src.getPageCount();
  const baseName = replaceExtension(opts.file.name, '');

  if (opts.mode === 'each') {
    const results: { filename: string; bytes: Uint8Array }[] = [];
    for (let i = 0; i < total; i++) {
      const out = await PDFDocument.create();
      const [p] = await out.copyPages(src, [i]);
      out.addPage(p);
      const saved = await out.save();
      results.push({ filename: `${baseName}_page_${i + 1}.pdf`, bytes: saved });
    }
    return results;
  }

  const pages = parsePageRanges(opts.ranges, total);
  if (pages.length === 0) throw new Error('No valid pages selected.');
  const out = await PDFDocument.create();
  const indices = pages.map((p) => p - 1);
  const copied = await out.copyPages(src, indices);
  for (const p of copied) out.addPage(p);
  const saved = await out.save();
  return [{ filename: `${baseName}_extracted.pdf`, bytes: saved }];
}

export async function rotatePdf(file: File, rotation: 90 | 180 | 270): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = doc.getPages();
  for (const page of pages) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  }
  return await doc.save();
}

export async function deletePages(file: File, pagesToDelete: number[]): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = src.getPageCount();
  const toDelete = new Set(pagesToDelete.map((p) => p - 1));
  const keep: number[] = [];
  for (let i = 0; i < total; i++) if (!toDelete.has(i)) keep.push(i);
  if (keep.length === 0) throw new Error('You cannot delete every page.');
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, keep);
  for (const p of copied) out.addPage(p);
  return await out.save();
}

export interface ReorderSpec {
  // 1-based page order, may contain duplicates
  order: number[];
  rotations: Record<number, 90 | 180 | 270>;
}

export async function reorderPdf(file: File, spec: ReorderSpec): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const indices = spec.order.map((p) => p - 1);
  const copied = await out.copyPages(src, indices);
  copied.forEach((page, i) => {
    const originalPage = spec.order[i];
    const rot = spec.rotations[originalPage];
    if (rot) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + rot) % 360));
    }
    out.addPage(page);
  });
  return await out.save();
}

export interface PageNumberOptions {
  file: File;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  startAt: number;
  fontSize: number;
  format: 'n' | 'n-of-m' | 'page-n' | 'page-n-of-m';
  color: { r: number; g: number; b: number };
}

export async function addPageNumbers(opts: PageNumberOptions): Promise<Uint8Array> {
  const bytes = await opts.file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const color = rgb(opts.color.r, opts.color.g, opts.color.b);
  const margin = 24;

  pages.forEach((page, i) => {
    const n = i + opts.startAt;
    let text: string;
    switch (opts.format) {
      case 'n-of-m':
        text = `${n} / ${total + opts.startAt - 1}`;
        break;
      case 'page-n':
        text = `Page ${n}`;
        break;
      case 'page-n-of-m':
        text = `Page ${n} of ${total + opts.startAt - 1}`;
        break;
      default:
        text = `${n}`;
    }
    const tw = font.widthOfTextAtSize(text, opts.fontSize);
    const { width, height } = page.getSize();
    let x: number, y: number;
    const isTop = opts.position.startsWith('top');
    if (opts.position.endsWith('center')) x = width / 2 - tw / 2;
    else if (opts.position.endsWith('right')) x = width - tw - margin;
    else x = margin;
    y = isTop ? height - margin : margin + opts.fontSize;
    page.drawText(text, { x, y, size: opts.fontSize, font, color });
  });

  return await doc.save();
}

export interface WatermarkOptions {
  file: File;
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: { r: number; g: number; b: number };
  tiled: boolean;
}

export async function addWatermark(opts: WatermarkOptions): Promise<Uint8Array> {
  if (!opts.text.trim()) throw new Error('Watermark text cannot be empty.');
  const bytes = await opts.file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const color = rgb(opts.color.r, opts.color.g, opts.color.b);
  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    if (opts.tiled) {
      const stepX = Math.max(opts.fontSize * 8, 200);
      const stepY = Math.max(opts.fontSize * 4, 120);
      for (let y = -height; y < height * 2; y += stepY) {
        for (let x = -width; x < width * 2; x += stepX) {
          page.drawText(opts.text, {
            x,
            y,
            size: opts.fontSize,
            font,
            color,
            opacity: opts.opacity,
            rotate: degrees(opts.rotation),
          });
        }
      }
    } else {
      const tw = font.widthOfTextAtSize(opts.text, opts.fontSize);
      page.drawText(opts.text, {
        x: width / 2 - tw / 2,
        y: height / 2,
        size: opts.fontSize,
        font,
        color,
        opacity: opts.opacity,
        rotate: degrees(opts.rotation),
      });
    }
  }
  return await doc.save();
}

export async function imagesToPdf(
  files: File[],
  pageSize: 'fit' | 'a4' | 'letter' = 'fit',
  orientation: 'portrait' | 'landscape' = 'portrait',
): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  // A4 in points: 595.28 x 841.89
  const A4 = { w: 595.28, h: 841.89 };
  const LETTER = { w: 612, h: 792 };

  for (const file of files) {
    const { embed, width, height } = await fileToImageEmbed(out, file);
    if (pageSize === 'fit') {
      const page = out.addPage([width, height]);
      page.drawImage(embed, { x: 0, y: 0, width, height });
    } else {
      const base = pageSize === 'a4' ? A4 : LETTER;
      const pw = orientation === 'landscape' ? base.h : base.w;
      const ph = orientation === 'landscape' ? base.w : base.h;
      const page = out.addPage([pw, ph]);
      const margin = 24;
      const maxW = pw - margin * 2;
      const maxH = ph - margin * 2;
      const scale = Math.min(maxW / width, maxH / height);
      const w = width * scale;
      const h = height * scale;
      page.drawImage(embed, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
  }
  return await out.save();
}

export async function pdfToImages(
  file: File,
  scale = 2,
  onProgress?: (done: number, total: number) => void,
): Promise<{ filename: string; blob: Blob }[]> {
  const doc = await loadPdfjs(file);
  const baseName = replaceExtension(file.name, '');
  const results: { filename: string; blob: Blob }[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const canvas = await renderPageToCanvas(page, scale);
    const blob = await canvasToBlob(canvas, 'image/png');
    results.push({ filename: `${baseName}_page_${i}.png`, blob });
    canvas.width = 0;
    canvas.height = 0;
    page.cleanup();
    onProgress?.(i, doc.numPages);
  }
  await destroyDoc(doc);
  return results;
}

export async function extractText(file: File): Promise<{ text: string; pages: string[] }> {
  const doc = await loadPdfjs(file);
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push(text);
    page.cleanup();
  }
  await destroyDoc(doc);
  return { text: pages.join('\n\n--- Page break ---\n\n'), pages };
}

export async function compressPdf(
  file: File,
  scale = 1.5,
  quality = 0.7,
  onProgress?: (done: number, total: number) => void,
): Promise<{ bytes: Uint8Array; originalSize: number; newSize: number }> {
  const originalSize = file.size;
  const doc = await loadPdfjs(file);
  const out = await PDFDocument.create();

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const canvas = await renderPageToCanvas(page, scale);
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    const bytes = new Uint8Array(await blobToArrayBuffer(blob));
    const img = await embedImage(out, bytes);
    const viewport = page.getViewport({ scale: 1 });
    const newPage = out.addPage([viewport.width, viewport.height]);
    newPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    canvas.width = 0;
    canvas.height = 0;
    page.cleanup();
    onProgress?.(i, doc.numPages);
  }
  await destroyDoc(doc);
  const bytes = await out.save();
  return { bytes, originalSize, newSize: bytes.byteLength };
}

export async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return {
    file,
    bytes,
    numPages: doc.getPageCount(),
    name: file.name,
  };
}
