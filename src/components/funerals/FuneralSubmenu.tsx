"use client";

import { Submenu } from "@/components/layout";

type ActiveKey = "gegevens" | "kosten" | "notities";

interface FuneralSubmenuProps {
  funeralId: string;
  active?: ActiveKey;
  className?: string;
}

export function FuneralSubmenu({
  funeralId,
  active,
  className,
}: FuneralSubmenuProps) {
  const base = `/funerals/${funeralId}`;
  const items = [
    {
      href: `${base}`,
      label: "Gegevens",
      isActive: active === "gegevens" || !active,
    },
    { href: `${base}/kosten`, label: "Kosten", isActive: active === "kosten" },
    {
      href: `${base}/notities`,
      label: "Notities",
      isActive: active === "notities",
    },
  ];

  return <Submenu items={items} className={className} />;
}
