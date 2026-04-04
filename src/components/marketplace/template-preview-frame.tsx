import type { ReactNode } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";

import { cn } from "@/lib/utils";
import type { WebsiteTemplateDevice } from "@/data/website-templates";

const DEVICE_CONFIG: Record<WebsiteTemplateDevice, { label: string; icon: typeof Monitor; viewportClassName: string }> = {
  desktop: {
    label: "Desktop",
    icon: Monitor,
    viewportClassName: "w-full",
  },
  tablet: {
    label: "Tablet",
    icon: Tablet,
    viewportClassName: "w-full max-w-[860px]",
  },
  mobile: {
    label: "Mobile",
    icon: Smartphone,
    viewportClassName: "w-full max-w-[420px]",
  },
};

type TemplatePreviewFrameProps = {
  code: string;
  title: string;
  device: WebsiteTemplateDevice;
  onDeviceChange?: (device: WebsiteTemplateDevice) => void;
  actions?: ReactNode;
  compact?: boolean;
  interactive?: boolean;
  className?: string;
};

export function TemplatePreviewFrame({
  code,
  title,
  device,
  onDeviceChange,
  actions,
  compact = false,
  interactive = true,
  className,
}: TemplatePreviewFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-black/6 bg-[#f7f7f9] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#d6d8dd]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d6d8dd]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d6d8dd]" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {onDeviceChange ? (
            <div className="inline-flex items-center gap-1 rounded-full border border-black/8 bg-white p-1 shadow-sm">
              {(["desktop", "tablet", "mobile"] as WebsiteTemplateDevice[]).map((option) => {
                const Icon = DEVICE_CONFIG[option].icon;
                const active = option === device;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onDeviceChange(option)}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors",
                      active ? "bg-[#111111] text-white" : "hover:bg-slate-100 hover:text-slate-900",
                    )}
                    aria-label={`Preview ${DEVICE_CONFIG[option].label}`}
                    title={`Preview ${DEVICE_CONFIG[option].label}`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          ) : null}

          {actions}
        </div>
      </div>

      <div className={cn("bg-[#edf1f6] p-4", compact ? "h-[17rem]" : "h-[34rem] md:h-[44rem] lg:h-[58rem]")}>
        <div
          className={cn(
            "mx-auto h-full overflow-hidden rounded-[1.5rem] border border-black/8 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.12)]",
            DEVICE_CONFIG[device].viewportClassName,
          )}
        >
          <iframe
            title={title}
            srcDoc={code}
            className={cn("h-full w-full bg-white", interactive ? "" : "pointer-events-none")}
          />
        </div>
      </div>
    </div>
  );
}
