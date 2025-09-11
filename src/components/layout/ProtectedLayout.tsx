"use client";

import { AuthGuard } from "@/components/auth";
import { OnboardingGuard } from "@/components/onboarding";
import { AppHeader } from "@/components/layout";

interface Breadcrumb {
  href: string;
  label: string;
}

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  breadcrumbs?: Breadcrumb[];
}

export function ProtectedLayout({
  children,
  requireOnboarding = true,
  breadcrumbs = [],
}: ProtectedLayoutProps) {
  return (
    <AuthGuard>
      <AppHeader breadcrumbs={breadcrumbs} />
      {requireOnboarding ? (
        <OnboardingGuard>{children}</OnboardingGuard>
      ) : (
        children
      )}
    </AuthGuard>
  );
}
