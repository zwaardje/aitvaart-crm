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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <OnboardingForm />
      </div>
    </div>
  );
}
