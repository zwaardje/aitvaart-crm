"use client";

import { cn } from "@/lib/utils";
import { Link } from "@/components/ui";

export type SubmenuItem = {
  href: string;
  label: string;
  isActive?: boolean;
};

interface SubmenuProps {
  items: SubmenuItem[];
  className?: string;
}

export function Submenu({ items, className }: SubmenuProps) {
  return (
    <nav
      className={cn(
        "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative inline-flex items-center px-4 py-3 text-sm font-medium transition-all duration-200",
                "border-b-2 border-transparent hover:border-muted-foreground/20",
                "hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                item.isActive
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              {item.isActive && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
