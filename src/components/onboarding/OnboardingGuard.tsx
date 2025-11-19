"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Spinner } from "@/components/ui/spinner/Spinner";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { needsOnboarding, isLoading, isAuthenticated } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to complete before making redirect decisions
    if (isLoading) return;

    // If authenticated and needs onboarding, redirect
    if (isAuthenticated && needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, isLoading, isAuthenticated, router]);

  // While loading, show spinner instead of blank page
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // If onboarding is needed, don't render children (redirect will happen)
  // Show spinner briefly while redirect happens
  if (needsOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
