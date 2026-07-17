import type { LucideIcon } from 'lucide-react';

export type ToolId =
  | 'merge'
  | 'split'
  | 'rotate'
  | 'delete-pages'
  | 'page-numbers'
  | 'watermark'
  | 'images-to-pdf'
  | 'pdf-to-images'
  | 'extract-text'
  | 'reorder'
  | 'compress'
  | 'info';

export interface Tool {
  id: ToolId;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  category: 'organize' | 'optimize' | 'convert' | 'edit';
  accent: string;
  multiple?: boolean;
}

export interface LoadedPdf {
  file: File;
  bytes: ArrayBuffer;
  numPages: number;
  name: string;
}

export interface PageThumb {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
}
