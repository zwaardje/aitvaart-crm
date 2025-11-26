"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RiArrowRightSLine } from "@remixicon/react";

interface GenericCardProps {
  title: string | ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  className?: string;
  to?: string;
  square?: boolean;
}

const Generic = ({
  to,
  className,
  title,
  subtitle,
  icon,
  content,
  footer,
  actions,
  square,
}: GenericCardProps) => {
  return (
    <Card
      className={cn(
        "relative rounded-sm",
        className,
        to && "shadow-none",
        square && "aspect-square"
      )}
    >
      <CardHeader className="pb-3 pl-3 pr-3 pt-3">
        <div
          className={cn(
            "flex items-start justify-between",
            to && "items-center"
          )}
        >
          <div className="flex-1">
            <CardTitle
              className={cn(
                "flex flex-col items-start gap-2 text-sm",
                to && "font-normal"
              )}
            >
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
          {to && (
            <div
              className={cn(
                "flex items-center gap-2",
                content && "absolute right-3 top-1/2 -translate-y-1/2"
              )}
            >
              <RiArrowRightSLine className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardHeader>
      {content && (
        <CardContent className={cn("pt-0 pl-3 pr-3 pb-3", to && "pr-20")}>
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
};

export function GenericCard({ to, ...props }: GenericCardProps) {
  return to ? (
    <Link href={to}>
      <Generic to={to} {...props} />
    </Link>
  ) : (
    <Generic {...props} />
  );
}
