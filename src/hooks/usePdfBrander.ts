/**
 * PDF Brander State Management Hook
 * Manages all application state: files with per-file branding options, processing
 */

import { useState, useCallback, useRef } from 'react';
import {
  type PDFFileItem,
  type BrandingOptions,
  type LogoPosition,
  type FileBrandingConfig,
  type FileImageAsset,
  DEFAULT_BRANDING_CONFIG,
  brandPdf,
  getPdfPageCount,
  generateId,
} from '@/lib/pdf-processor';
import JSZip from 'jszip';

export type AppStep = 'upload' | 'configure' | 'process' | 'download';

// Re-export for components that imported LogoFile
export type LogoFile = FileImageAsset;

export function useBrander() {
  const [step, setStep] = useState<AppStep>('upload');
  const [pdfFiles, setPdfFiles] = useState<PDFFileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const abortRef = useRef(false);
  const pdfFilesRef = useRef(pdfFiles);
  pdfFilesRef.current = pdfFiles;

  // ---- Helpers to get/update selected file's branding ----

  const selectedFile = pdfFiles.find((f) => f.id === selectedFileId) ?? pdfFiles[0] ?? null;

  const updateFileBranding = useCallback(
    (fileId: string, update: Partial<FileBrandingConfig>) => {
      setPdfFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, branding: { ...f.branding, ...update } } : f
        )
      );
    },
    []
  );

  // ---- File management ----

  const addPdfFiles = useCallback(async (files: File[]) => {
    const newItems: PDFFileItem[] = [];

    for (const file of files) {
      if (file.type !== 'application/pdf') continue;

      try {
        const bytes = await file.arrayBuffer();
        const pageCount = await getPdfPageCount(bytes);
        newItems.push({
          id: generateId(),
          file,
          name: file.name,
          pageCount,
          status: 'queued',
          progress: 0,
          branding: { ...DEFAULT_BRANDING_CONFIG },
        });
      } catch {
        newItems.push({
          id: generateId(),
          file,
          name: file.name,
          pageCount: 0,
          status: 'error',
          progress: 0,
          errorMessage: 'Could not read PDF file',
          branding: { ...DEFAULT_BRANDING_CONFIG },
        });
      }
    }

    setPdfFiles((prev) => {
      const next = [...prev, ...newItems];
      return next;
    });

    // Auto-select first file if none selected
    if (newItems.length > 0) {
      setSelectedFileId((prev) => prev ?? newItems[0].id);
    }

    return newItems;
  }, []);

  const removePdfFile = useCallback((id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedFileId((prev) => (prev === id ? null : prev));
  }, []);

  const clearAllFiles = useCallback(() => {
    setPdfFiles([]);
    setSelectedFileId(null);
  }, []);

  // ---- Per-file branding setters ----

  const setFileLogo = useCallback(
    async (file: File) => {
      if (!selectedFile) return;
      const data = await file.arrayBuffer();
      const previewUrl = URL.createObjectURL(file);
      updateFileBranding(selectedFile.id, {
        logo: { file, previewUrl, data, mimeType: file.type },
      });
    },
    [selectedFile, updateFileBranding]
  );

  const removeFileLogo = useCallback(() => {
    if (!selectedFile?.branding.logo) return;
    URL.revokeObjectURL(selectedFile.branding.logo.previewUrl);
    updateFileBranding(selectedFile.id, { logo: null });
  }, [selectedFile, updateFileBranding]);

  const setFilePosition = useCallback(
    (v: LogoPosition) => {
      if (selectedFile) updateFileBranding(selectedFile.id, { position: v });
    },
    [selectedFile, updateFileBranding]
  );

  const setFileScale = useCallback(
    (v: number) => {
      if (selectedFile) updateFileBranding(selectedFile.id, { scale: v });
    },
    [selectedFile, updateFileBranding]
  );

  const setFileOpacity = useCallback(
    (v: number) => {
      if (selectedFile) updateFileBranding(selectedFile.id, { opacity: v });
    },
    [selectedFile, updateFileBranding]
  );

  const setFilePadding = useCallback(
    (v: number) => {
      if (selectedFile) updateFileBranding(selectedFile.id, { padding: v });
    },
    [selectedFile, updateFileBranding]
  );

  const setFileSkipCover = useCallback(
    (v: boolean) => {
      if (selectedFile) updateFileBranding(selectedFile.id, { skipCoverPage: v });
    },
    [selectedFile, updateFileBranding]
  );

  const setFileCoverPage = useCallback(
    async (file: File) => {
      if (!selectedFile) return;
      const data = await file.arrayBuffer();
      const previewUrl = URL.createObjectURL(file);
      updateFileBranding(selectedFile.id, {
        coverPageImage: { file, previewUrl, data, mimeType: file.type },
      });
    },
    [selectedFile, updateFileBranding]
  );

  const removeFileCoverPage = useCallback(() => {
    if (!selectedFile?.branding.coverPageImage) return;
    URL.revokeObjectURL(selectedFile.branding.coverPageImage.previewUrl);
    updateFileBranding(selectedFile.id, { coverPageImage: null });
  }, [selectedFile, updateFileBranding]);

  // ---- Apply current file's settings to all other files ----

  const applyToAll = useCallback(() => {
    if (!selectedFile) return;
    const source = selectedFile.branding;
    setPdfFiles((prev) =>
      prev.map((f) => {
        if (f.id === selectedFile.id) return f;
        // Clean up old URLs before overwriting
        if (f.branding.logo && f.branding.logo !== source.logo) {
          URL.revokeObjectURL(f.branding.logo.previewUrl);
        }
        if (f.branding.coverPageImage && f.branding.coverPageImage !== source.coverPageImage) {
          URL.revokeObjectURL(f.branding.coverPageImage.previewUrl);
        }
        return { ...f, branding: { ...source } };
      })
    );
  }, [selectedFile]);

  // ---- Processing ----

  const processAllPdfs = useCallback(async () => {
    setIsProcessing(true);
    abortRef.current = false;

    const filesToProcess = [...pdfFilesRef.current];

    for (let i = 0; i < filesToProcess.length; i++) {
      if (abortRef.current) break;

      const item = filesToProcess[i];
      if (item.status === 'done') continue;

      const { branding } = item;
      if (!branding.logo) {
        // Skip files without a logo configured
        setPdfFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: 'error' as const, progress: 0, errorMessage: 'No logo configured' }
              : f
          )
        );
        continue;
      }

      const options: BrandingOptions = {
        logoData: branding.logo.data,
        logoMimeType: branding.logo.mimeType,
        position: branding.position,
        scale: branding.scale,
        opacity: branding.opacity,
        padding: branding.padding,
        skipCoverPage: branding.skipCoverPage,
        coverPageImage: branding.coverPageImage
          ? { data: branding.coverPageImage.data, mimeType: branding.coverPageImage.mimeType }
          : undefined,
      };

      setPdfFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 'processing' as const, progress: 0 } : f
        )
      );

      try {
        const pdfBytes = await item.file.arrayBuffer();
        const brandedBytes = await brandPdf(pdfBytes, options, (progress) => {
          setPdfFiles((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, progress: Math.round(progress * 100) } : f
            )
          );
        });

        setPdfFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: 'done' as const, progress: 100, brandedPdfBytes: brandedBytes }
              : f
          )
        );
      } catch (err) {
        setPdfFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: 'error' as const,
                  progress: 0,
                  errorMessage: err instanceof Error ? err.message : 'Processing failed',
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
  }, []);

  const cancelProcessing = useCallback(() => {
    abortRef.current = true;
  }, []);

  // ---- Downloads ----

  const downloadSinglePdf = useCallback((item: PDFFileItem) => {
    if (!item.brandedPdfBytes) return;
    const blob = new Blob([item.brandedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branded_${item.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAllAsZip = useCallback(async () => {
    const completedFiles = pdfFilesRef.current.filter(
      (f) => f.status === 'done' && f.brandedPdfBytes
    );
    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    for (const item of completedFiles) {
      zip.file(`branded_${item.name}`, item.brandedPdfBytes!);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'branded_pdfs.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // ---- Reset ----

  const resetAll = useCallback(() => {
    // Clean up object URLs
    for (const f of pdfFilesRef.current) {
      if (f.branding.logo) URL.revokeObjectURL(f.branding.logo.previewUrl);
      if (f.branding.coverPageImage) URL.revokeObjectURL(f.branding.coverPageImage.previewUrl);
    }
    setPdfFiles([]);
    setSelectedFileId(null);
    setStep('upload');
    setIsProcessing(false);
    abortRef.current = false;
  }, []);

  // ---- Computed ----

  const completedCount = pdfFiles.filter((f) => f.status === 'done').length;
  const totalCount = pdfFiles.length;
  const hasErrors = pdfFiles.some((f) => f.status === 'error');
  const allDone = totalCount > 0 && completedCount === totalCount;
  const overallProgress =
    totalCount > 0
      ? Math.round(pdfFiles.reduce((sum, f) => sum + f.progress, 0) / totalCount)
      : 0;
  const canProcess = pdfFiles.length > 0 && pdfFiles.some((f) => f.branding.logo !== null);

  return {
    // State
    step,
    setStep,
    pdfFiles,
    selectedFile,
    selectedFileId,
    setSelectedFileId,
    isProcessing,
    previewFileId,
    setPreviewFileId,

    // Computed
    completedCount,
    totalCount,
    hasErrors,
    allDone,
    overallProgress,
    canProcess,

    // File management
    addPdfFiles,
    removePdfFile,
    clearAllFiles,

    // Per-file branding
    setFileLogo,
    removeFileLogo,
    setFilePosition,
    setFileScale,
    setFileOpacity,
    setFilePadding,
    setFileSkipCover,
    setFileCoverPage,
    removeFileCoverPage,
    applyToAll,

    // Processing & downloads
    processAllPdfs,
    cancelProcessing,
    downloadSinglePdf,
    downloadAllAsZip,
    resetAll,
  };
}
