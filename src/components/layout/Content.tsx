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
        "h-[calc(100vh-10rem)]",
        "space-y-3 mx-auto max-w-7xl py-2 px-4 w-full flex gap-4 bg-gray-50",
        className
      )}
    >
      {children}
    </div>
  );
}
