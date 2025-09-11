"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

type Deceased = Database["public"]["Tables"]["deceased"]["Row"];
type DeceasedInsert = Database["public"]["Tables"]["deceased"]["Insert"];
type DeceasedUpdate = Database["public"]["Tables"]["deceased"]["Update"];

export function useDeceased() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  // Get all deceased for the current user
  const deceasedQuery = useQuery({
    queryKey: ["deceased"],
    queryFn: async (): Promise<Deceased[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("deceased")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Create deceased mutation
  const createDeceasedMutation = useMutation({
    mutationFn: async (
      deceasedData: Omit<DeceasedInsert, "entrepreneur_id">
    ) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("deceased")
        .insert({
          ...deceasedData,
          entrepreneur_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deceased"] });
    },
  });

  // Update deceased mutation
  const updateDeceasedMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: DeceasedUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("deceased")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deceased"] });
    },
  });

  // Delete deceased mutation
  const deleteDeceasedMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("deceased").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deceased"] });
    },
  });

  return {
    deceased: deceasedQuery.data ?? [],
    isLoading: deceasedQuery.isLoading,
    error: deceasedQuery.error,
    createDeceased: createDeceasedMutation.mutate,
    isCreating: createDeceasedMutation.isPending,
    updateDeceased: updateDeceasedMutation.mutate,
    isUpdating: updateDeceasedMutation.isPending,
    deleteDeceased: deleteDeceasedMutation.mutate,
    isDeleting: deleteDeceasedMutation.isPending,
    refetch: deceasedQuery.refetch,
  };
}

export function useDeceasedPerson(id: string) {
  const queryClient = useQueryClient();

  // Get single deceased person
  const deceasedQuery = useQuery({
    queryKey: ["deceased", id],
    queryFn: async (): Promise<Deceased | null> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("deceased")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows returned
        throw error;
      }
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });

  // Update deceased mutation
  const updateDeceasedMutation = useMutation({
    mutationFn: async (updates: DeceasedUpdate) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("deceased")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["deceased", id], data);
      queryClient.invalidateQueries({ queryKey: ["deceased"] });
    },
  });

  return {
    deceased: deceasedQuery.data,
    isLoading: deceasedQuery.isLoading,
    error: deceasedQuery.error,
    updateDeceased: updateDeceasedMutation.mutate,
    isUpdating: updateDeceasedMutation.isPending,
    refetch: deceasedQuery.refetch,
  };
}
