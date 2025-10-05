"use client";

import { FUNERAL_TABS } from "@/constants/funerals";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFuneral } from "@/hooks/useFunerals";
import { useMemo, use } from "react";
import React from "react";
import { Submenu } from "@/components/layout";
import { Content } from "@/components/layout";

export default function FuneralLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const { funeral, isLoading: funeralLoading } = useFuneral(id);
  const base = `/funerals/${id}`;
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

  // Bepaal de naam van de overledene
  const deceasedName = funeral?.deceased
    ? [funeral.deceased.first_names, funeral.deceased.last_name]
        .filter(Boolean)
        .join(" ")
    : undefined;

  const handleBackClick = () => {
    router.push("/funerals");
  };

  const handleMenuClick = () => {
    // TODO: Implementeer sidebar menu
    console.log("Menu clicked - open sidebar");
  };

  return (
    <>
      <Submenu items={items} />

      <Content>
        <div className="px-3 lg:px-6 space-y-3  lg:space-y-6 w-full">
          {children}
        </div>
      </Content>
    </>
  );
}
