"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  href: string;
  label: string;
}

interface AppHeaderProps {
  logo?: React.ReactNode;
  className?: string;
  showDeceasedName?: boolean;
  funeralName?: string;
  pageTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function AppHeader({
  logo,
  className,
  showDeceasedName,
  funeralName,
  pageTitle,
  showBackButton = false,
  onBackClick,
}: AppHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      // Navigate to parent level instead of browser back
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split("/").filter(Boolean);

      if (pathSegments.length > 1) {
        // Remove the last segment to go up one level
        const parentPath = "/" + pathSegments.slice(0, -1).join("/");
        router.push(parentPath);
      } else {
        // If we're at root level, just go to dashboard
        router.push("/dashboard");
      }
    }
  };

  const displayTitle = showDeceasedName
    ? funeralName
    : pageTitle || "Aitvaart CRM";

  return (
    <header
      className={cn(
        "w-full flex justify-between items-center px-4 py-2 z-40 bg-white",
        "sticky top-0",
        className
      )}
    >
      {showBackButton && (
        <Button
          variant="outline"
          size="icon"
          onClick={showBackButton && handleBackClick}
          className="shrink-0 h-10 w-10 rounded-lg"
        >
          <RiArrowLeftLine className="h-5 w-5" />
        </Button>
      )}
      {!showBackButton && (
        <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-lgcursor-pointer">
          {logo}
        </div>
      )}

      <div className="flex-1 text-center">
        <h1 className="text-md letter-spacing-1 font-semibold text-gray-900 truncate">
          {displayTitle}
        </h1>
      </div>
    </header>
  );
}
