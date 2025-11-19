import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useOnboarding() {
  const queryClient = useQueryClient();
  const {
    profile,
    isLoading: authLoading,
    isAuthenticated,
    refetchProfile,
  } = useAuth();

  // Complete onboarding mutation
  const { user } = useAuth();

  const completeOnboardingMutation = useMutation({
    mutationFn: async (onboardingData: {
      companyName: string;
      fullName: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
      kvkNumber: string;
      btwNumber?: string;
      website?: string;
      description: string;
    }) => {
      if (!user?.id) {
        throw new Error("No user session");
      }

      // Use API route instead of direct Supabase call
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete onboarding");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch profile so dependent checks update
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });

  return {
    needsOnboarding:
      isAuthenticated &&
      !authLoading &&
      (!profile || !profile.onboarding_completed),
    profile: profile ?? null,
    isLoading: authLoading,
    isAuthenticated,
    completeOnboarding: completeOnboardingMutation.mutate,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
    onboardingError: completeOnboardingMutation.error,
    refetchOnboarding: refetchProfile,
  };
}
