"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";
import { Button, Breadcrumb } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  href: string;
  label: string;
}

interface AppHeaderProps {
  logo?: React.ReactNode;
  className?: string;
  deceasedName?: string;
  pageTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
}

export function AppHeader({
  logo,
  className,
  deceasedName,
  pageTitle,
  showBackButton = false,
  onBackClick,
  onMenuClick,
}: AppHeaderProps) {
  const router = useRouter();
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const displayTitle = deceasedName || pageTitle || "Aitvaart CRM";

  return (
    <header
      className={cn(
        "w-full flex justify-between items-center px-4 py-2 z-40 bg-gray-100",
        "md:relative fixed top-0 left-0 right-0",
        className
      )}
    >
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={showBackButton ? handleBackClick : onMenuClick}
          className="shrink-0 h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          <RiArrowLeftLine className="h-5 w-5" />
        </Button>
      )}
      {!showBackButton && (
        <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
          {logo}
        </div>
      )}

      <div className="flex-1 text-center">
        <h1 className="text-md letter-spacing-1 font-semibold text-gray-900 truncate">
          {displayTitle}
        </h1>
      </div>
      <div className="flex items-center w-10"></div>
    </header>
  );
}
