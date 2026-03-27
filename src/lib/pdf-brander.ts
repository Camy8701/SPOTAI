/**
 * PDF Brander - Core Processing Engine
 * Uses pdf-lib for PDF manipulation (embedding logos on every page)
 * Uses pdfjs-dist for rendering PDF pages to canvas for preview
 */

import { PDFDocument } from 'pdf-lib';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export type LogoPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface BrandingOptions {
  logoData: ArrayBuffer;
  logoMimeType: string;
  position: LogoPosition;
  scale: number; // 0.05 to 0.5 (percentage of page width)
  opacity: number; // 0 to 1
  padding: number; // pixels from edge
  skipCoverPage: boolean; // don't brand the first page
  coverPageImage?: { data: ArrayBuffer; mimeType: string }; // replace cover page
}

export interface FileImageAsset {
  file: File;
  previewUrl: string;
  data: ArrayBuffer;
  mimeType: string;
}

export interface FileBrandingConfig {
  logo: FileImageAsset | null;
  position: LogoPosition;
  scale: number;
  opacity: number;
  padding: number;
  skipCoverPage: boolean;
  coverPageImage: FileImageAsset | null;
}

export const DEFAULT_BRANDING_CONFIG: FileBrandingConfig = {
  logo: null,
  position: 'bottom-right',
  scale: 0.15,
  opacity: 0.85,
  padding: 20,
  skipCoverPage: false,
  coverPageImage: null,
};

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  status: 'queued' | 'processing' | 'done' | 'error';
  progress: number;
  brandedPdfBytes?: Uint8Array;
  errorMessage?: string;
  previewUrl?: string;
  branding: FileBrandingConfig;
}

function getLogoCoordinates(
  position: LogoPosition,
  pageWidth: number,
  pageHeight: number,
  logoWidth: number,
  logoHeight: number,
  padding: number
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  // Horizontal
  if (position.includes('left')) {
    x = padding;
  } else if (position.includes('right')) {
    x = pageWidth - logoWidth - padding;
  } else {
    x = (pageWidth - logoWidth) / 2;
  }

  // Vertical (PDF coordinates: 0,0 is bottom-left)
  if (position.includes('top')) {
    y = pageHeight - logoHeight - padding;
  } else if (position.includes('bottom')) {
    y = padding;
  } else {
    y = (pageHeight - logoHeight) / 2;
  }

  return { x, y };
}

export async function brandPdf(
  pdfBytes: ArrayBuffer,
  options: BrandingOptions,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  // Replace cover page if a new cover image is provided
  if (options.coverPageImage && totalPages > 0) {
    const coverPage = pages[0];
    const { width: pageWidth, height: pageHeight } = coverPage.getSize();

    let coverImage;
    if (options.coverPageImage.mimeType === 'image/png') {
      coverImage = await pdfDoc.embedPng(options.coverPageImage.data);
    } else {
      coverImage = await pdfDoc.embedJpg(options.coverPageImage.data);
    }

    // Clear existing content by drawing a white rectangle, then draw the new cover
    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: { type: 'RGB', red: 1, green: 1, blue: 1 } as any,
    });

    // Scale cover image to fit the page while maintaining aspect ratio
    const coverDims = coverImage.scale(1);
    const scaleX = pageWidth / coverDims.width;
    const scaleY = pageHeight / coverDims.height;
    const coverScale = Math.min(scaleX, scaleY);
    const scaledWidth = coverDims.width * coverScale;
    const scaledHeight = coverDims.height * coverScale;

    coverPage.drawImage(coverImage, {
      x: (pageWidth - scaledWidth) / 2,
      y: (pageHeight - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  // Embed the logo image
  let logoImage;
  if (options.logoMimeType === 'image/png') {
    logoImage = await pdfDoc.embedPng(options.logoData);
  } else {
    logoImage = await pdfDoc.embedJpg(options.logoData);
  }

  const logoDims = logoImage.scale(1);

  // Determine the start page for branding (skip cover if requested)
  const startPage = options.skipCoverPage ? 1 : 0;

  for (let i = 0; i < totalPages; i++) {
    if (i < startPage) {
      onProgress?.((i + 1) / totalPages);
      continue;
    }

    const page = pages[i];
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Calculate logo size based on scale (percentage of page width)
    const targetWidth = pageWidth * options.scale;
    const aspectRatio = logoDims.height / logoDims.width;
    const targetHeight = targetWidth * aspectRatio;

    const { x, y } = getLogoCoordinates(
      options.position,
      pageWidth,
      pageHeight,
      targetWidth,
      targetHeight,
      options.padding
    );

    page.drawImage(logoImage, {
      x,
      y,
      width: targetWidth,
      height: targetHeight,
      opacity: options.opacity,
    });

    onProgress?.((i + 1) / totalPages);

    // Yield to main thread so UI can update
    if (i % 5 === 4) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return pdfDoc.save();
}

export async function getPdfPageCount(pdfBytes: ArrayBuffer): Promise<number> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  return pdfDoc.getPageCount();
}

export function renderPdfPageToCanvas(
  pdfBytes: ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  maxWidth: number
): { promise: Promise<void>; cancel: () => void } {
  let cancelled = false;
  let renderTask: any = null;

  const promise = (async () => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

    if (cancelled) return;

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) });
    const pdf = await loadingTask.promise;

    if (cancelled) return;

    const page = await pdf.getPage(pageNumber);

    if (cancelled) return;

    const viewport = page.getViewport({ scale: 1 });
    const scale = maxWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const context = canvas.getContext('2d');
    if (!context || cancelled) return;

    renderTask = page.render({
      canvasContext: context,
      viewport: scaledViewport,
      canvas,
    } as any);

    await renderTask.promise;
  })();

  return {
    promise,
    cancel: () => {
      cancelled = true;
      if (renderTask) {
        try { renderTask.cancel(); } catch { /* already done */ }
      }
    },
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
