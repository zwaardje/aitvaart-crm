"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { cn } from "@/lib/utils";

interface GenericCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function GenericCard({
  title,
  subtitle,
  icon,
  content,
  footer,
  actions,
  className,
}: GenericCardProps) {
  return (
    <Card className={cn("relative rounded-sm", className)}>
      <CardHeader className="pb-3 pl-3 pr-3 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex flex-col items-start gap-2 text-sm">
              {icon}
              {title}
            </CardTitle>
            {subtitle && (
              <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs">
                <span>{subtitle}</span>
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </CardHeader>
      {content && (
        <CardContent className="pt-0 pl-3 pr-3 pb-3">
          <div className="prose prose-sm max-w-none text-sm">{content}</div>
        </CardContent>
      )}

      {footer && (
        <CardFooter className="flex items-center justify-between border-t pt-3 pb-3 pl-3 pr-3 border-gray-100 bg-gray-50">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
