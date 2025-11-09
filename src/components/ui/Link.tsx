"use client";

import * as React from "react";
import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const linkVariants = cva(
  "underline-offset-4 hover:underline transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow hover:bg-primary/90 radius-xs ",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        icon: "bg-transparent border-0 shadow-none p-0 text-muted-foreground hover:text-foreground hover:bg-transparent focus-visible:ring-0",
        "icon-outline":
          "bg-transparent border-0 shadow-none p-0 text-muted-foreground hover:text-foreground hover:bg-transparent focus-visible:ring-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs [&_svg]:size-3",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      type: {
        link: "text-primary underline-offset-4 hover:underline transition-colors",
        button:
          "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      },
    },
    defaultVariants: {
      variant: "link",
      size: "default",
      type: "link",
    },
  }
);

type AnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "type"
> & {
  href: string;
};

export interface AppLinkProps
  extends AnchorProps,
    VariantProps<typeof linkVariants> {}

export const Link = ({
  className,
  children,
  variant,
  size,
  type,
  ...props
}: AppLinkProps) => {
  return (
    <NextLink
      className={cn(linkVariants({ variant, size, type, className }))}
      {...props}
    >
      {children}
    </NextLink>
  );
};
