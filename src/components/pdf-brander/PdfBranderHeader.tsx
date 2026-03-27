/**
 * Header - App header with logo and step indicator
 * Design: Clean top bar with warm accents
 */

import { Stamp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppStep } from '@/hooks/useBrander';

interface HeaderProps {
  step: AppStep;
  onReset: () => void;
  hasFiles: boolean;
}

const steps: { id: AppStep; label: string; number: number }[] = [
  { id: 'upload', label: 'Upload', number: 1 },
  { id: 'configure', label: 'Configure', number: 2 },
  { id: 'process', label: 'Process', number: 3 },
  { id: 'download', label: 'Download', number: 4 },
];

export default function Header({ step, onReset, hasFiles }: HeaderProps) {
  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center">
            <Stamp className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            PDF Brander
          </span>
        </div>

        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                    ${i <= currentIndex
                      ? 'bg-coral text-white'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {s.number}
                </div>
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    i <= currentIndex ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-6 h-px mx-1.5 transition-colors duration-300 ${
                    i < currentIndex ? 'bg-coral' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Reset */}
        {hasFiles && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Start Over
          </Button>
        )}
      </div>
    </header>
  );
}
