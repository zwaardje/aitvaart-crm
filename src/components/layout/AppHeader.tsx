"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiSettings3Line,
  RiLogoutBoxLine,
  RiUser3Line,
  RiMenuLine,
  RiArrowLeftLine,
  RiInformationLine,
} from "@remixicon/react";
import {
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Skeleton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  href: string;
  label: string;
}

interface AppHeaderProps {
  breadcrumbs?: Breadcrumb[];
  logo?: React.ReactNode;
  className?: string;
  deceasedName?: string;
  pageTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
}

export function AppHeader({
  breadcrumbs = [],
  logo,
  className,
  deceasedName,
  pageTitle,
  showBackButton = false,
  onBackClick,
  onMenuClick,
}: AppHeaderProps) {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();

  const initials = (user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const displayTitle = deceasedName || pageTitle || "Aitvaart CRM";

  return (
    <header className={cn("w-full relative z-40 bg-gray-100", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={showBackButton ? handleBackClick : onMenuClick}
            className="shrink-0 h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            {showBackButton ? (
              <RiArrowLeftLine className="h-5 w-5" />
            ) : (
              <RiMenuLine className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {displayTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-10 px-2"
              >
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="hidden sm:block text-sm">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={undefined}
                        alt={user?.email ?? "user"}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-sm">
                      <div className="font-medium leading-none truncate max-w-[12rem]">
                        {user?.email || "Gebruiker"}
                      </div>
                    </div>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 z-50"
              align="end"
              sideOffset={8}
              side="bottom"
              avoidCollisions={true}
              collisionPadding={8}
            >
              <DropdownMenuLabel className="font-semibold text-gray-900">
                Account
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <RiUser3Line className="mr-2 h-4 w-4" /> Profiel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <RiSettings3Line className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
              >
                <RiLogoutBoxLine className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {breadcrumbs.length > 0 && (
          <Breadcrumb className="hidden sm:flex text-xs">
            <BreadcrumbList>
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={bc.href}>
                  <BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link href={bc.href}>
                          {bc.label === "…" ? (
                            <Skeleton className="h-3 w-16 inline-block align-middle" />
                          ) : (
                            bc.label
                          )}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>
                        {bc.label === "…" ? (
                          <Skeleton className="h-3 w-16 inline-block align-middle" />
                        ) : (
                          bc.label
                        )}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
    </header>
  );
}
