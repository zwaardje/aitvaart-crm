"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  RiSparklingLine,
  RiSettings3Line,
  RiDashboardLine,
  RiCrossLine,
} from "@remixicon/react";
import { Link } from "@/components/ui";
import { cn } from "@/lib/utils";

interface NavigationItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    icon: RiDashboardLine,
  },
  {
    href: "/funerals",
    icon: RiCrossLine,
  },
  {
    href: "/voice-assistant",
    icon: RiSparklingLine,
  },

  {
    href: "/settings",
    icon: RiSettings3Line,
  },
];

interface MainNavigationProps {
  className?: string;
}

export function MainNavigation({ className }: MainNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50",
        "flex items-center justify-around",
        className
      )}
    >
      {navigationItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-0 flex-1",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </Link>
        );
      })}
    </nav>
  );
}
