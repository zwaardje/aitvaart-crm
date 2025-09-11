"use client";

import * as React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export interface AppLinkProps extends AnchorProps {}

export const Link = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <NextLink
        ref={ref}
        className={cn(
          "text-primary underline-offset-4 font-medium transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
Link.displayName = "Link";
