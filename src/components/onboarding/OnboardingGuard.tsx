"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTranslations } from "next-intl";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { needsOnboarding, isLoading, isAuthenticated } = useOnboarding();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    // Wait for loading to complete before making redirect decisions
    if (isLoading) return;

    // If authenticated and needs onboarding, redirect
    if (isAuthenticated && needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, isLoading, isAuthenticated, router]);

  // While loading, block rendering to prevent flash
  if (isLoading) return null;

  // If onboarding is needed, don't render children (redirect will happen)
  if (needsOnboarding) return null;

  return <>{children}</>;
}
