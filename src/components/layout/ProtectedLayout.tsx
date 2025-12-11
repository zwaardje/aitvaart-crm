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
  const isDeceasedPage = pathname.includes("/deceased");
  const isContactPage = pathname.includes("/contacts/") && contactId;

  const { data: funeralName, isLoading: isLoadingFuneralName } = useFuneralName(
    funeralId || ""
  );

  const { data: contactName, isLoading: isLoadingContactName } = useContactName(
    contactId || ""
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
    if (pathname.includes("/contacts")) return "Nabestaanden";
    return "Aitvaart CRM";
  };

  const showMenu = pathname !== "/onboarding";

  const showDeceasedName = useMemo(() => {
    return Boolean(isDeceasedPage && funeralName);
  }, [isDeceasedPage, funeralName]);

  const showContactNameInHeader = useMemo(() => {
    return Boolean(isContactPage && contactName);
  }, [isContactPage, contactName]);

  // Determine which name to show: contact name has priority over funeral name
  const displayName = showContactNameInHeader
    ? contactName
    : showDeceasedName
    ? funeralName
    : undefined;

  // Check if URL ends with a UUID
  const lastSegment = segments[segments.length - 1];
  const isLastSegmentUuid =
    uuids.length > 0 && lastSegment === uuids[uuids.length - 1];
  const showDeleteButton = isLastSegmentUuid && uuids.length > 0;

  return (
    <AuthGuard>
      <AppHeader
        showDeceasedName={showDeceasedName || showContactNameInHeader}
        pageTitle={pageTitle()}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
        funeralName={displayName ?? undefined}
        logo={<Logo />}
        deleteButton={
          showDeleteButton ? (
            <EntityDeleteButton pathname={pathname} />
          ) : undefined
        }
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
