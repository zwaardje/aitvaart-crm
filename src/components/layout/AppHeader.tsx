"use client";

import * as React from "react";
import { Link as NextLink } from "next/link";
import {
  RiSettings3Line,
  RiLogoutBoxLine,
  RiUser3Line,
  RiDashboardLine,
  RiStoreLine,
  RiHeartLine,
  RiMenuLine,
} from "@remixicon/react";
import {
  Link,
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
}

export function AppHeader({
  breadcrumbs = [],
  logo,
  className,
}: AppHeaderProps) {
  const { user, signOut, isLoading } = useAuth();

  const initials = (user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={cn("w-full border-b bg-card py-2", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 min-w-0">
          <div className="shrink-0">
            <a href="/dashboard">{logo ? logo : "Aitvaart CRM"}</a>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/funerals"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Uitvaarten
            </Link>
            <Link
              href="/suppliers"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Leveranciers
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Navigation menu"
                >
                  <RiMenuLine className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Navigatie</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <RiDashboardLine className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/funerals" className="flex items-center">
                      <RiHeartLine className="mr-2 h-4 w-4" /> Uitvaarten
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/suppliers" className="flex items-center">
                      <RiStoreLine className="mr-2 h-4 w-4" /> Leveranciers
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
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
                    src={user?.image ?? undefined}
                    alt={user?.name ?? user?.email ?? "user"}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-sm">
                  <div className="font-medium leading-none truncate max-w-[12rem]">
                    {user?.name || user?.email || "Gebruiker"}
                  </div>
                </div>
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account menu">
                <RiUser3Line className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile" className="flex items-center">
                    <RiUser3Line className="mr-2 h-4 w-4" /> Profiel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <RiSettings3Line className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="flex items-center">
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
