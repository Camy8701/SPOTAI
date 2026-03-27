/**
 * PositionPicker - Visual 3x3 grid for selecting logo placement
 * Design: Mini document preview with interactive position dots
 */

import type { LogoPosition } from '@/lib/pdf-processor';
import { motion } from 'framer-motion';

interface PositionPickerProps {
  value: LogoPosition;
  onChange: (position: LogoPosition) => void;
}

const positions: { id: LogoPosition; label: string; row: number; col: number }[] = [
  { id: 'top-left', label: 'Top Left', row: 0, col: 0 },
  { id: 'top-center', label: 'Top Center', row: 0, col: 1 },
  { id: 'top-right', label: 'Top Right', row: 0, col: 2 },
  { id: 'center-left', label: 'Center Left', row: 1, col: 0 },
  { id: 'center', label: 'Center', row: 1, col: 1 },
  { id: 'center-right', label: 'Center Right', row: 1, col: 2 },
  { id: 'bottom-left', label: 'Bottom Left', row: 2, col: 0 },
  { id: 'bottom-center', label: 'Bottom Center', row: 2, col: 1 },
  { id: 'bottom-right', label: 'Bottom Right', row: 2, col: 2 },
];

export default function PositionPicker({ value, onChange }: PositionPickerProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground mb-2 block">
        Logo Position
      </label>

      <div className="flex items-center gap-4">
        {/* Document preview */}
        <div className="relative w-[120px] h-[156px] rounded-lg border-2 border-border bg-white shadow-sm shrink-0">
          {/* Page lines */}
          <div className="absolute inset-3 flex flex-col gap-1.5">
            <div className="h-1 bg-border/60 rounded-full w-3/4" />
            <div className="h-1 bg-border/40 rounded-full w-full" />
            <div className="h-1 bg-border/40 rounded-full w-5/6" />
            <div className="h-1 bg-border/30 rounded-full w-full" />
            <div className="h-1 bg-border/30 rounded-full w-2/3" />
          </div>

          {/* Position grid overlay */}
          <div className="absolute inset-2 grid grid-cols-3 grid-rows-3">
            {positions.map((pos) => {
              const isSelected = value === pos.id;
              return (
                <button
                  key={pos.id}
                  onClick={() => onChange(pos.id)}
                  className="relative flex items-center justify-center group"
                  title={pos.label}
                >
                  <div
                    className={`
                      w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center
                      ${isSelected
                        ? 'bg-coral shadow-md shadow-coral/30 scale-110'
                        : 'bg-border/50 hover:bg-coral/40 hover:scale-105'
                      }
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="position-indicator"
                        className="w-2 h-2 rounded-full bg-white"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Position label */}
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {positions.find((p) => p.id === value)?.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click a position on the document to change placement
          </p>
        </div>
      </div>
    </div>
  );
}
