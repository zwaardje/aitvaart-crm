import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border  text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-red-400 text-destructive-foreground shadow hover:bg-red-400/80",
        outline: "text-foreground",
      },
      size: {
        default: "text-xs px-1.5 py-0.5",
        sm: "text-xs px-2 py-1",
        lg: "text-sm px-2.5 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: boolean;
}

function Badge({ className, variant, size, icon, ...props }: BadgeProps) {
  const iconClass = icon ? "pl-1 pr-1" : "";
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className, iconClass)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
