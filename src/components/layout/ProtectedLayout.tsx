"use client";

import { AuthGuard } from "@/components/auth";
import { OnboardingGuard } from "@/components/onboarding";
import { AppHeader, MainNavigation } from "@/components/layout";
import { usePathname } from "next/navigation";

interface Breadcrumb {
  href: string;
  label: string;
}

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  breadcrumbs?: Breadcrumb[];
  deceasedName?: string;
  pageTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
}

export function ProtectedLayout({
  children,
  requireOnboarding = true,
  breadcrumbs = [],
  deceasedName,
  pageTitle,
  showBackButton = false,
  onBackClick,
  onMenuClick,
}: ProtectedLayoutProps) {
  const pathname = usePathname();

  // Bepaal of we een back button moeten tonen (als we niet op de hoofdpagina zijn)
  const shouldShowBackButton =
    showBackButton ||
    (!pathname.includes("/dashboard") &&
      !pathname.includes("/funerals") &&
      !pathname.includes("/suppliers"));

  return (
    <AuthGuard>
      <AppHeader
        breadcrumbs={breadcrumbs}
        deceasedName={deceasedName}
        pageTitle={pageTitle}
        showBackButton={shouldShowBackButton}
        onBackClick={onBackClick}
        onMenuClick={onMenuClick}
      />
      <div className="pb-16">
        {requireOnboarding ? (
          <OnboardingGuard>{children}</OnboardingGuard>
        ) : (
          children
        )}
      </div>
      <MainNavigation />
    </AuthGuard>
  );
}
