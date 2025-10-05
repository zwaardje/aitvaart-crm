"use client";

import { ProtectedLayout } from "@/components/layout";
import { usePathname } from "next/navigation";
import { useFuneralName } from "@/hooks/useFunerals";
import { useState } from "react";

export default function ProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
      deceasedName={getDeceasedName()}
      pageTitle={getPageTitle()}
      showBackButton={shouldShowBackButton}
      onMenuClick={handleMenuClick}
    >
      {children}
    </ProtectedLayout>
  );
}
