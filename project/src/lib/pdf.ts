import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the worker once.
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export { PDFDocument, degrees, rgb, StandardFonts };
export type PdfjsDoc = pdfjsLib.PDFDocumentProxy;
export type PdfjsPage = pdfjsLib.PDFPageProxy;

export async function loadPdfjs(file: File): Promise<PdfjsDoc> {
  const buf = await file.arrayBuffer();
  const task = pdfjsLib.getDocument({ data: buf });
  return task.promise;
}

export async function destroyDoc(doc: PdfjsDoc): Promise<void> {
  try {
    await doc.loadingTask.destroy();
  } catch {}
}

export async function renderPageToCanvas(
  page: PdfjsPage,
  scale = 1,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type, quality);
  });
}

export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}

export async function renderPageThumb(page: PdfjsPage, targetWidth = 200): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.7),
    width: canvas.width,
    height: canvas.height,
  };
}

export async function getDocInfo(file: File) {
  const doc = await loadPdfjs(file);
  const meta = await doc.getMetadata().catch(() => null);
  const metaInfo = meta?.info as
    | Record<string, string | undefined>
    | undefined;
  const info = {
    numPages: doc.numPages,
    title: metaInfo?.Title || '',
    author: metaInfo?.Author || '',
    subject: metaInfo?.Subject || '',
    creator: metaInfo?.Creator || '',
    producer: metaInfo?.Producer || '',
    creationDate: metaInfo?.CreationDate || '',
    modDate: metaInfo?.ModDate || '',
    encrypted: false,
  };
  let firstPageSize: { width: number; height: number } | null = null;
  try {
    const firstPage = await doc.getPage(1);
    const vp = firstPage.getViewport({ scale: 1 });
    firstPageSize = { width: vp.width, height: vp.height };
    firstPage.cleanup();
  } catch {}
  await destroyDoc(doc);
  return { ...info, firstPageSize, fileSize: file.size };
}

export function parsePageRanges(input: string, max: number): number[] {
  // Returns 1-based page indices.
  const result = new Set<number>();
  for (const part of input.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = trimmed.match(/^(\d+)-(\d+)$/);
    if (m) {
      let [a, b] = [+m[1], +m[2]];
      if (a > b) [a, b] = [b, a];
      for (let i = a; i <= b; i++) if (i >= 1 && i <= max) result.add(i);
      continue;
    }
    const single = +trimmed;
    if (!Number.isNaN(single) && single >= 1 && single <= max) result.add(single);
  }
  return [...result].sort((a, b) => a - b);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export function downloadBytes(bytes: Uint8Array | ArrayBuffer | Blob, filename: string) {
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function replaceExtension(name: string, ext: string): string {
  const base = name.replace(/\.[^/.]+$/, '');
  return `${base}.${ext}`;
}

// Load an image File into pdf-lib embeddable form.
export async function embedImage(pdfDoc: PDFDocument, bytes: Uint8Array) {
  // Detect type by magic bytes.
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  if (isPng) return await pdfDoc.embedPng(bytes);
  if (isJpeg) return await pdfDoc.embedJpg(bytes);
  // Fallback: try png then jpg.
  try {
    return await pdfDoc.embedPng(bytes);
  } catch {
    return await pdfDoc.embedJpg(bytes);
  }
}

export async function jpegBlobFromFile(file: File): Promise<Blob> {
  // Convert any image type to JPEG via canvas (so pdf-lib can embed it).
  if (file.type === 'image/jpeg' || file.type === 'image/png') return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', 0.92),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

export async function fileToImageEmbed(
  pdfDoc: PDFDocument,
  file: File,
): Promise<{ embed: Awaited<ReturnType<typeof pdfDoc.embedJpg>>; width: number; height: number }> {
  const blob = await jpegBlobFromFile(file);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const embed = await embedImage(pdfDoc, bytes);
  return { embed, width: embed.width, height: embed.height };
}
