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
        "w-full border-b bg-gray-100 sticky top-14 md:top-0 z-30",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "overflow-x-auto scrollbar-hide py-2",
            "[&::-webkit-scrollbar]:hidden",
            "[-ms-overflow-style:none]",
            "[scrollbar-width:none]",
            "scroll-smooth"
          )}
        >
          <div className="flex space-x-1 min-w-max">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex items-center px-2 py-2 text-xs font-medium transition-all duration-200 rounded-sm whitespace-nowrap flex-shrink-0",
                  item.isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
