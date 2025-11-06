"use client";

import { SETTINGS_TABS, SETTINGS_CHILD_TABS } from "@/constants/submenu";
import { usePathname } from "next/navigation";
import React from "react";
import { Submenu } from "@/components/layout";
import { Content } from "@/components/layout";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);
  const base =
    pathSegments.length >= 2
      ? `/${pathSegments[0]}/${pathSegments[1]}`
      : pathname;

  const isChildPage = pathname.includes(`${base}/`) && pathname !== base;

  const tabsToUse = isChildPage ? SETTINGS_CHILD_TABS : SETTINGS_TABS;

  const items = tabsToUse.map((tab) => ({
    href: `${base}${tab.segment}`,
    label: tab.label,
    isActive: pathname === `${base}${tab.segment}`,
  }));

  return (
    <>
      <Submenu items={items} />
      <Content>{children}</Content>
    </>
  );
}
