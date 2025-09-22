"use client";

import { ProtectedLayout } from "@/components/layout";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFuneralName } from "@/hooks/useFunerals";
import { useState, useEffect } from "react";

export default function ProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations("breadcrumbs");

  // Extract funeral ID from pathname for dynamic name fetching
  const segments = pathname.split("/").filter(Boolean);
  const funeralId = segments.find((segment) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  );

  const [isHydrated, setIsHydrated] = useState(false);
  const { data: funeralName, isLoading: isLoadingFuneralName } = useFuneralName(
    funeralId || ""
  );

  // Track hydration to prevent mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Generate breadcrumbs dynamically based on current path
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Only add Dashboard if we're not already on the dashboard
    if (pathname !== "/dashboard") {
      breadcrumbs.push({ href: "/dashboard", label: t("dashboard") });
    }

    // Process each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const currentPath = "/" + segments.slice(0, i + 1).join("/");
      const nextSegment = segments[i + 1];

      // Check if this is a UUID (funeral ID) - only if it's under /funerals
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment
        ) &&
        i > 0 &&
        segments[i - 1] === "funerals"
      ) {
        // This is a funeral ID under /funerals
        const label = funeralName
          ? funeralName
          : isLoadingFuneralName
          ? "…"
          : t("uitvaart");

        breadcrumbs.push({
          href: currentPath,
          label,
        });

        // Don't add "gegevens" breadcrumb anymore
      } else {
        // This is a regular segment
        const translationKey = segment;
        const label =
          t(translationKey) !== translationKey
            ? t(translationKey)
            : segment.charAt(0).toUpperCase() + segment.slice(1);

        breadcrumbs.push({ href: currentPath, label });
      }
    }

    return breadcrumbs;
  };

  // Bepaal of we een back button moeten tonen
  const shouldShowBackButton =
    pathname !== "/dashboard" &&
    !pathname.includes("/suppliers") &&
    !pathname.endsWith("/funerals");

  // Bepaal de pagina titel en overledene naam
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.includes("/funerals")) return "Uitvaarten";
    if (pathname.includes("/suppliers")) return "Leveranciers";
    return "Aitvaart CRM";
  };

  // Bepaal of we de naam van de overledene moeten tonen
  const getDeceasedName = () => {
    if (pathname.includes("/funerals/") && funeralName) {
      return funeralName;
    }
    return undefined;
  };

  const handleMenuClick = () => {
    // TODO: Implementeer sidebar menu
    console.log("Menu clicked - open sidebar");
  };

  return (
    <ProtectedLayout
      requireOnboarding={true}
      breadcrumbs={
        isHydrated
          ? generateBreadcrumbs()
          : [{ href: "/dashboard", label: t("dashboard") }]
      }
      deceasedName={getDeceasedName()}
      pageTitle={getPageTitle()}
      showBackButton={shouldShowBackButton}
      onMenuClick={handleMenuClick}
    >
      {children}
    </ProtectedLayout>
  );
}
