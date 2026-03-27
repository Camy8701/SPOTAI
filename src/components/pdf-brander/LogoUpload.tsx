/**
 * LogoUpload - Upload and preview branding logo/image
 * Design: Compact card with image preview and remove action
 */

import { useRef, useState, useCallback } from 'react';
import { Image, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogoFile } from '@/hooks/useBrander';

interface LogoUploadProps {
  logo: LogoFile | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export default function LogoUpload({ logo, onUpload, onRemove }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="text-sm font-semibold text-foreground mb-2 block">
        Brand Logo
      </label>

      <AnimatePresence mode="wait">
        {logo ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={logo.previewUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{logo.file.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {logo.mimeType === 'image/png' ? 'PNG' : 'JPEG'} · {(logo.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={onRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              rounded-lg border-2 border-dashed p-5 transition-all duration-200 cursor-pointer
              ${isDragging
                ? 'border-coral bg-coral-light/30'
                : 'border-border hover:border-coral/50 hover:bg-sand/50'
              }
            `}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                <Image className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Upload logo</p>
              <p className="text-xs text-muted-foreground mt-0.5">PNG or JPG</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
