/**
 * FileList - Shows uploaded PDF files with status, progress, and actions
 * Design: Warm card style with pill-shaped status tags
 */

import { type PDFFileItem } from '@/lib/pdf-processor';
import { FileText, X, Check, AlertCircle, Loader2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface FileListProps {
  files: PDFFileItem[];
  onRemove: (id: string) => void;
  onDownload?: (item: PDFFileItem) => void;
  onPreview?: (id: string) => void;
  showActions?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ status }: { status: PDFFileItem['status'] }) {
  const config = {
    queued: { label: 'Queued', className: 'bg-muted text-muted-foreground' },
    processing: { label: 'Processing', className: 'bg-coral-light text-coral' },
    done: { label: 'Done', className: 'bg-sage-light text-sage' },
    error: { label: 'Error', className: 'bg-destructive/10 text-destructive' },
  };

  const { label, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'done' && <Check className="w-3 h-3" />}
      {status === 'error' && <AlertCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

export default function FileList({ files, onRemove, onDownload, onPreview, showActions = true }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {files.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className="overflow-hidden"
          >
            <div
              className={`
                relative group rounded-lg border bg-card p-3.5 transition-all duration-200
                ${item.status === 'processing' ? 'border-coral/30 shadow-sm' : 'border-border hover:border-border/80'}
                ${item.status === 'done' ? 'border-sage/30' : ''}
              `}
            >
              {/* Shimmer overlay for processing */}
              {item.status === 'processing' && (
                <div className="absolute inset-0 shimmer rounded-lg pointer-events-none" />
              )}

              <div className="flex items-center gap-3">
                {/* File icon */}
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                  ${item.status === 'done' ? 'bg-sage-light' : item.status === 'error' ? 'bg-destructive/10' : 'bg-muted'}
                `}>
                  <FileText className={`w-5 h-5 ${
                    item.status === 'done' ? 'text-sage' : item.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
                  }`} />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.pageCount > 0 ? `${item.pageCount} pages` : ''}
                    {item.pageCount > 0 && item.file.size > 0 ? ' · ' : ''}
                    {item.file.size > 0 ? formatFileSize(item.file.size) : ''}
                    {item.errorMessage ? ` — ${item.errorMessage}` : ''}
                  </p>
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'done' && onPreview && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onPreview(item.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {item.status === 'done' && onDownload && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-sage"
                        onClick={() => onDownload(item)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {(item.status === 'queued' || item.status === 'error') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {item.status === 'processing' && (
                <div className="mt-2.5 flex items-center gap-2">
                  <Progress value={item.progress} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground tabular-nums w-8 text-right">
                    {item.progress}%
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
