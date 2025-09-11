"use client";

import { FUNERAL_TABS } from "@/constants/funerals";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFuneral } from "@/hooks/useFunerals";
import { Skeleton, Card } from "@/components/ui";
import { Link } from "@/components/ui";
import { useMemo } from "react";
import React from "react";
import { SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { RiAddLine } from "@remixicon/react";
import { Content } from "@/components/layout";

export default function FuneralLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const { funeral, isLoading: funeralLoading } = useFuneral(params.id);
  const base = `/funerals/${params.id}`;
  const items = FUNERAL_TABS.map((tab) => ({
    href: `${base}${tab.segment}`,
    label: t(tab.label),
    isActive: pathname === `${base}${tab.segment}`,
  }));

  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    const parts = (pathname || "/").split("/").filter(Boolean);
    const funeralsIdx = parts.indexOf("funerals");
    const acc: { href: string; label: string }[] = [];

    parts.forEach((part, idx) => {
      const href = "/" + parts.slice(0, idx + 1).join("/");
      let label = part
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

      // Show loading state for funeral name when funeral data is loading
      if (funeralsIdx >= 0 && idx === funeralsIdx + 1) {
        if (funeralLoading) {
          label = "…";
        } else {
          const fullName = [
            funeral?.deceased?.first_names,
            funeral?.deceased?.last_name,
          ]
            .filter(Boolean)
            .join(" ");
          label = fullName || "…";
        }
      }

      acc.push({ href, label });
    });
    return acc;
  }, [
    pathname,
    funeral?.deceased?.first_names,
    funeral?.deceased?.last_name,
    funeralLoading,
  ]);

  return (
    <Content>
      <div className="p-6 space-y-6 w-full">
        <SectionHeader
          title="Uitvaarten"
          description="Beheer alle uitvaarten en hun details"
          actions={
            <Button>
              <RiAddLine className="h-4 w-4 mr-2" />
              Nieuwe uitvaart
            </Button>
          }
        />
        {/* Funeral Card Container */}
        <div className="">
          {/* Funeral Header with Submenu */}
          <div className="border-b bg-muted/30">
            {funeralLoading ? (
              <div className="py-4">
                <div className="flex space-x-1">
                  {FUNERAL_TABS.map((_, index) => (
                    <Skeleton key={index} className="h-12 w-20" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="flex space-x-1">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative inline-flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 border-transparent hover:border-muted-foreground/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 ${
                        item.isActive
                          ? "text-primary border-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                      {item.isActive && (
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>{children}</div>
        </div>
      </div>
    </Content>
  );
}
