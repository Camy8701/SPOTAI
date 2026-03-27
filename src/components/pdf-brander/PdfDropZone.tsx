/**
 * PdfDropZone - Drag & drop or click to upload PDF files
 * Design: Warm minimal with dashed border, coral accent on hover
 */

import { useCallback, useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PdfDropZoneProps {
  onFilesAdded: (files: File[]) => void;
  fileCount: number;
  maxFiles?: number;
}

export default function PdfDropZone({ onFilesAdded, fileCount, maxFiles = 10 }: PdfDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === 'application/pdf'
      );
      const remaining = maxFiles - fileCount;
      if (remaining > 0 && files.length > 0) {
        onFilesAdded(files.slice(0, remaining));
      }
    },
    [onFilesAdded, fileCount, maxFiles]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxFiles - fileCount;
    if (remaining > 0 && files.length > 0) {
      onFilesAdded(files.slice(0, remaining));
    }
    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  const isFull = fileCount >= maxFiles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        onClick={isFull ? undefined : handleClick}
        onDragOver={isFull ? undefined : handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={isFull ? undefined : handleDrop}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-300
          ${isFull
            ? 'border-border bg-muted/50 cursor-not-allowed opacity-60'
            : isDragging
              ? 'border-coral bg-coral-light/30 scale-[1.01]'
              : 'border-border hover:border-coral/50 hover:bg-sand/50 cursor-pointer'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.div
                key="dragging"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-coral" />
                </div>
                <p className="text-lg font-semibold text-coral">Drop your PDFs here</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  {isFull ? 'Maximum files reached' : 'Upload your PDFs'}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {isFull
                    ? `You've added ${fileCount} of ${maxFiles} files`
                    : 'Drag & drop or click to browse'}
                </p>
                {!isFull && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                    <FileText className="w-3.5 h-3.5" />
                    PDF files only — up to {maxFiles} files
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </motion.div>
  );
}
