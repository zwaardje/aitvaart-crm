"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SidesheetPortal } from "@/components/ui/sidessheet-portal";
import { RiCloseLine } from "@remixicon/react";

interface SideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SideSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: SideSheetProps) {
  return (
    <SidesheetPortal selector="body">
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-200",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-full sm:w-[480px] lg:w-[560px] max-w-full bg-background border-l shadow-xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div>
            {title && <div className="text-sm font-medium">{title}</div>}
            {description && (
              <div className="text-xs text-muted-foreground">{description}</div>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        <div className="h-[calc(100vh-45px)] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-muted">
          {children}
        </div>
      </div>
    </SidesheetPortal>
  );
}
