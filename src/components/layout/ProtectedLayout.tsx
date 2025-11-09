"use client";

import { AuthGuard } from "@/components/auth";
import { OnboardingGuard } from "@/components/onboarding";
import { AppHeader, MainNavigation } from "@/components/layout";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { useFuneralName } from "@/hooks/useFunerals";
import { useMemo } from "react";
import { Content } from "@/components/layout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  onBackClick?: () => void;
}

export function ProtectedLayout({
  children,
  requireOnboarding = true,
  onBackClick,
}: ProtectedLayoutProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const funeralId = segments.find((segment) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  );

  const { data: funeralName, isLoading: isLoadingFuneralName } = useFuneralName(
    funeralId || ""
  );

  const showBackButton =
    pathname !== "/dashboard" &&
    !pathname.includes("/settings/") &&
    !pathname.endsWith("/funerals") &&
    !pathname.includes("/intake");

  const pageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.includes("/funerals")) return "Uitvaarten";
    if (pathname.includes("/suppliers")) return "Instellingen";
    if (pathname.includes("/intake")) return "Intake";
    return "Aitvaart CRM";
  };

  const showMenu = pathname !== "/onboarding";

  const showDeceasedName = useMemo(() => {
    return Boolean(pathname.includes("/funerals/") && funeralName);
  }, [pathname, funeralName]);

  return (
    <AuthGuard>
      <AppHeader
        showDeceasedName={showDeceasedName}
        pageTitle={pageTitle()}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
        funeralName={funeralName ?? undefined}
        logo={<Logo />}
      />
      <Content>
        {requireOnboarding ? (
          <OnboardingGuard>{children}</OnboardingGuard>
        ) : (
          children
        )}
      </Content>
      {showMenu && <MainNavigation />}
    </AuthGuard>
  );
}
