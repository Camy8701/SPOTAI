/**
 * CoverPageControls - Toggle to skip branding on cover page + upload replacement cover
 */

import { useCallback, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';

interface CoverPageControlsProps {
  skipCoverPage: boolean;
  onSkipChange: (skip: boolean) => void;
  coverPreviewUrl: string | null;
  onCoverUpload: (file: File) => void;
  onCoverRemove: () => void;
}

export default function CoverPageControls({
  skipCoverPage,
  onSkipChange,
  coverPreviewUrl,
  onCoverUpload,
  onCoverRemove,
}: CoverPageControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
        onCoverUpload(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [onCoverUpload]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Cover Page</h3>

      {/* Skip branding toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="skip-cover" className="text-sm text-muted-foreground">
          Skip branding on cover
        </label>
        <Switch
          id="skip-cover"
          checked={skipCoverPage}
          onCheckedChange={onSkipChange}
        />
      </div>

      {/* Replace cover image */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Replace cover page</p>
        {coverPreviewUrl ? (
          <div className="relative group rounded-lg border border-border overflow-hidden bg-muted">
            <img
              src={coverPreviewUrl}
              alt="New cover"
              className="w-full h-32 object-contain bg-white"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onCoverRemove}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-20 rounded-lg border-2 border-dashed border-border hover:border-coral/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-coral/70"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs">Upload cover image</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-[10px] text-muted-foreground mt-1">PNG or JPG. Will be scaled to fit the page.</p>
      </div>
    </div>
  );
}
