"use client";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function OnboardingPage() {
  const { needsOnboarding, isLoading, isAuthenticated } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && !needsOnboarding) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, needsOnboarding, router]);

  if (isLoading) return null;
  if (!needsOnboarding) return null;

  return <OnboardingForm />;
}
