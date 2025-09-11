"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUser } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, loading } = useCurrentUser();

  // Get user profile
  const profileQuery = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;

      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows returned
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // 1 second delay
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user?.id) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });

  // Sign out function
  const signOut = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    queryClient.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
  };

  return {
    user: user,
    profile: profileQuery.data,
    isLoading: loading || profileQuery.isLoading,
    isAuthenticated: !!user,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    signOut,
    refetchProfile: profileQuery.refetch,
  };
}
