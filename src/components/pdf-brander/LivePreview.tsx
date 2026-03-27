/**
 * LivePreview - Shows a real-time preview of logo placement on a PDF page
 * Renders the first page of the first PDF and overlays the logo
 */

import { useEffect, useRef, useState } from 'react';
import { renderPdfPageToCanvas } from '@/lib/pdf-processor';
import type { LogoPosition } from '@/lib/pdf-processor';
import type { LogoFile } from '@/hooks/useBrander';
import type { PDFFileItem } from '@/lib/pdf-processor';
import { Eye } from 'lucide-react';

interface LivePreviewProps {
  pdfFile: PDFFileItem | null;
  logo: LogoFile | null;
  position: LogoPosition;
  scale: number;
  opacity: number;
  padding: number;
}

function getLogoStyle(
  position: LogoPosition,
  scale: number,
  opacity: number,
  padding: number,
  containerWidth: number,
  containerHeight: number
): React.CSSProperties {
  const logoWidth = containerWidth * scale;
  const paddingPx = (padding / 595) * containerWidth; // Normalize padding to container

  const style: React.CSSProperties = {
    position: 'absolute',
    width: `${logoWidth}px`,
    opacity,
    objectFit: 'contain',
    pointerEvents: 'none',
    zIndex: 10,
  };

  // Horizontal
  if (position.includes('left')) {
    style.left = `${paddingPx}px`;
  } else if (position.includes('right')) {
    style.right = `${paddingPx}px`;
  } else {
    style.left = '50%';
    style.transform = 'translateX(-50%)';
  }

  // Vertical
  if (position.includes('top')) {
    style.top = `${paddingPx}px`;
  } else if (position.includes('bottom')) {
    style.bottom = `${paddingPx}px`;
  } else {
    if (style.transform) {
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
    } else {
      style.top = '50%';
      style.transform = 'translateY(-50%)';
    }
  }

  return style;
}

export default function LivePreview({ pdfFile, logo, position, scale, opacity, padding }: LivePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<{ cancel: () => void } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!pdfFile?.file || !canvasRef.current) return;

    // Cancel any in-flight render
    renderRef.current?.cancel();

    setIsRendering(true);
    const canvas = canvasRef.current;

    (async () => {
      try {
        const bytes = await pdfFile.file.arrayBuffer();
        const maxWidth = containerRef.current?.clientWidth || 400;
        const task = renderPdfPageToCanvas(bytes, 1, canvas, maxWidth);
        renderRef.current = task;
        await task.promise;
        setCanvasSize({ width: canvas.width, height: canvas.height });
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Preview render error:', err);
        }
      }
      setIsRendering(false);
    })();

    return () => {
      renderRef.current?.cancel();
    };
  }, [pdfFile?.id]);

  const hasContent = pdfFile && logo;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
      </div>

      <div
        ref={containerRef}
        className="flex-1 rounded-xl bg-[#f0ede8] border border-border/50 flex items-center justify-center overflow-hidden p-4"
        style={{ minHeight: '300px' }}
      >
        {!pdfFile ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Upload a PDF to see preview</p>
          </div>
        ) : (
          <div className="relative inline-block shadow-xl rounded-sm">
            {isRendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 rounded-sm">
                <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="block bg-white rounded-sm"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            {/* Logo overlay */}
            {logo && canvasSize.width > 0 && (
              <img
                src={logo.previewUrl}
                alt="Logo"
                style={getLogoStyle(position, scale, opacity, padding, canvasSize.width, canvasSize.height)}
              />
            )}
          </div>
        )}
      </div>

      {hasContent && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Showing page 1 of <span className="font-medium">{pdfFile.name}</span>
        </p>
      )}
    </div>
  );
}
