"use client";

import { FUNERAL_TABS } from "@/constants/funerals";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import React from "react";
import { Submenu } from "@/components/layout";
import { Content } from "@/components/layout";

export default function FuneralLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }> | { id: string };
}) {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);
  const pathname = usePathname();
  const t = useTranslations();

  const base = `/funerals/${id}`;

  const items = FUNERAL_TABS.map((tab) => ({
    href: `${base}${tab.segment}`,
    label: t(tab.label),
    isActive: pathname === `${base}${tab.segment}`,
  }));

  return (
    <>
      <Submenu items={items} />
      <Content>
        <div className="p-2  w-full">{children}</div>
      </Content>
    </>
  );
}
