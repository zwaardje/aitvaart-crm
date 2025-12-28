"use client";

import { AuthGuard } from "@/components/auth";
import { OnboardingGuard } from "@/components/onboarding";
import { AppHeader, MainNavigation } from "@/components/layout";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { useFuneralName } from "@/hooks/useFunerals";
import { useContactName } from "@/hooks/useFuneralContacts";
import { useMemo } from "react";
import { Content } from "@/components/layout";
import { EntityDeleteButton } from "./EntityDeleteButton";

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

  // Find all UUIDs in the path
  const uuids = segments.filter((segment) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  );

  const funeralId = uuids[0] || null;
  const contactId = pathname.includes("/contacts/") ? uuids[1] || null : null;

  const { data: funeralName, isLoading: isLoadingFuneralName } = useFuneralName(
    funeralId || ""
  );

  const showBackButton =
    pathname !== "/dashboard" &&
    !pathname.includes("/settings/") &&
    !pathname.endsWith("/funerals") &&
    !pathname.includes("/onboarding") &&
    !pathname.includes("/intake");

  const pageTitle = () => {
    if (pathname.includes("/suppliers")) return "Instellingen";
    if (pathname.includes("/intake")) return "Intake";
    if (pathname.includes("/contacts")) return " ";
    if (pathname.includes("/deceased")) return " ";
    if (pathname.includes("/notes")) return "Notities";
    if (pathname.includes("/wishes")) return "Wensen";
    if (pathname.includes("/costs")) return "Kosten";
    if (pathname.includes("/documents")) return "Documenten";
    if (pathname.includes("/actions")) return "Acties";
    if (pathname.includes("/scenarios")) return "Scenario's";
    if (pathname.includes("/funerals") && uuids.length == 1)
      return "Begleiding";
    if (pathname.includes("/funerals")) return "Begleidingen";

    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/onboarding") return "Onboarding";

    return "Aitvaart CRM";
  };

  const showMenu = pathname !== "/onboarding";

  // Check if URL ends with a UUID
  const lastSegment = segments[segments.length - 1];

  return (
    <AuthGuard>
      {pathname !== "/onboarding" && (
        <AppHeader
          pageTitle={pageTitle()}
          showBackButton={showBackButton}
          onBackClick={onBackClick}
          logo={<Logo />}
        />
      )}
      <Content className={pathname === "/onboarding" ? "h-[100vh]" : ""}>
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
