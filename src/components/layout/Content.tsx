"use client";

import { cn } from "@/lib/utils";

interface ContentProps {
  children: React.ReactNode;
  className?: string;
}

// Content wrapper that adds ~5px padding and vertical spacing between sections
export function Content({ children, className }: ContentProps) {
  return (
    <div
      className={cn(
        "space-y-3 mx-auto max-w-7xl py-2 h-14 flex gap-4 min-h-screen bg-gray-50",
        className
      )}
    >
      {children}
    </div>
  );
}
