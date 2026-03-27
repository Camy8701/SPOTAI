/**
 * BrandingControls - Sliders for scale, opacity, and padding
 * Design: Clean labeled sliders with value readouts
 */

import { Slider } from '@/components/ui/slider';

interface BrandingControlsProps {
  scale: number;
  opacity: number;
  padding: number;
  onScaleChange: (v: number) => void;
  onOpacityChange: (v: number) => void;
  onPaddingChange: (v: number) => void;
}

export default function BrandingControls({
  scale,
  opacity,
  padding,
  onScaleChange,
  onOpacityChange,
  onPaddingChange,
}: BrandingControlsProps) {
  return (
    <div className="space-y-5">
      {/* Scale */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-foreground">Logo Size</label>
          <span className="text-xs font-medium text-muted-foreground tabular-nums bg-muted px-2 py-0.5 rounded">
            {Math.round(scale * 100)}%
          </span>
        </div>
        <Slider
          value={[scale]}
          min={0.03}
          max={0.5}
          step={0.01}
          onValueChange={([v]) => onScaleChange(v)}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">Small</span>
          <span className="text-[10px] text-muted-foreground">Large</span>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-foreground">Opacity</label>
          <span className="text-xs font-medium text-muted-foreground tabular-nums bg-muted px-2 py-0.5 rounded">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <Slider
          value={[opacity]}
          min={0.05}
          max={1}
          step={0.05}
          onValueChange={([v]) => onOpacityChange(v)}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">Transparent</span>
          <span className="text-[10px] text-muted-foreground">Solid</span>
        </div>
      </div>

      {/* Padding */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-foreground">Edge Padding</label>
          <span className="text-xs font-medium text-muted-foreground tabular-nums bg-muted px-2 py-0.5 rounded">
            {padding}px
          </span>
        </div>
        <Slider
          value={[padding]}
          min={0}
          max={80}
          step={2}
          onValueChange={([v]) => onPaddingChange(v)}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">None</span>
          <span className="text-[10px] text-muted-foreground">Wide</span>
        </div>
      </div>
    </div>
  );
}
