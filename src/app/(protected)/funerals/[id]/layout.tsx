"use client";

import { FUNERAL_TABS } from "@/constants/submenu";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import { Submenu } from "@/components/layout";

export default function FuneralLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }> | { id: string };
}) {
  const [id, setId] = useState<string>("");

  const pathname = usePathname();
  const base = `/funerals/${id}`;
  const pathSegments = pathname.split("/").filter(Boolean);

  // Find all UUIDs in the path
  const uuids = pathSegments.filter((segment) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  );

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);

  const hideSubmenu =
    pathSegments.includes("deceased") ||
    pathSegments.includes("contacts") ||
    (pathSegments.includes("wishes") && uuids.length === 2);

  const items = FUNERAL_TABS.map((tab) => ({
    href: `${base}${tab.segment}`,
    label: tab.label,
    isActive: pathname === `${base}${tab.segment}`,
  }));

  return (
    <>
      {!hideSubmenu && <Submenu items={items} />}
      {children}
    </>
  );
}
