"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode | React.ReactNode[];
  scale?: "xs" | "sm" | "lg" | "xl";
  className?: string;
}

export function SectionHeader({
  title,
  description,
  icon,
  actions,
  scale = "sm",
  className,
}: SectionHeaderProps) {
  const titleScale = {
    xs: "text-sm leading-5",
    sm: "text-base leading-6",
    lg: "text-lg leading-7",
    xl: "text-xl leading-8",
  }[scale];

  const descriptionScale = {
    xs: "text-xs",
    sm: "text-sm",
    lg: "text-base",
    xl: "text-base",
  }[scale];

  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-muted-foreground/20">
            <span className="text-muted-foreground">{icon}</span>
          </div>
        )}
        <div>
          <h2 className={cn("font-semibold", titleScale)}>{title}</h2>
          {description && (
            <p className={cn("mt-1 text-muted-foreground", descriptionScale)}>
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="ml-auto flex items-center gap-2">
          {React.Children.toArray(actions)}
        </div>
      )}
    </div>
  );
}
