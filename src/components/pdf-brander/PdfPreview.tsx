/**
 * PdfPreview - Modal to preview branded PDF pages
 * Renders pages using pdfjs-dist to canvas
 */

import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import { renderPdfPageToCanvas } from '@/lib/pdf-processor';
import type { PDFFileItem } from '@/lib/pdf-processor';

interface PdfPreviewProps {
  file: PDFFileItem | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (item: PDFFileItem) => void;
}

export default function PdfPreview({ file, open, onClose, onDownload }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<{ cancel: () => void } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (open && file) {
      setCurrentPage(1);
      setZoom(1);
    }
  }, [open, file]);

  useEffect(() => {
    if (!open || !file?.brandedPdfBytes || !canvasRef.current) return;

    // Cancel any in-flight render
    renderRef.current?.cancel();

    setIsLoading(true);
    const canvas = canvasRef.current;

    (async () => {
      try {
        const maxWidth = Math.min(600, window.innerWidth - 80) * zoom;
        const bytesCopy = file.brandedPdfBytes!.slice().buffer;
        const task = renderPdfPageToCanvas(bytesCopy, currentPage, canvas, maxWidth);
        renderRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Preview render error:', err);
        }
      }
      setIsLoading(false);
    })();

    return () => {
      renderRef.current?.cancel();
    };
  }, [open, file, currentPage, zoom]);

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[700px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-semibold">
                Preview: {file.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Page {currentPage} of {file.pageCount}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-10 text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                disabled={zoom >= 2}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              {onDownload && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-sage hover:text-sage"
                  onClick={() => onDownload(file)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Canvas area */}
        <div className="overflow-auto flex-1 bg-muted/50 flex items-start justify-center p-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="shadow-lg rounded-sm bg-white"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        {/* Page navigation */}
        {file.pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 px-5 py-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {currentPage} / {file.pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(file.pageCount, p + 1))}
              disabled={currentPage >= file.pageCount}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
