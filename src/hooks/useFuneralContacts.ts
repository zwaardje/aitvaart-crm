"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

type FuneralContact = Database["public"]["Tables"]["funeral_contacts"]["Row"];
type FuneralContactInsert =
  Database["public"]["Tables"]["funeral_contacts"]["Insert"];
type FuneralContactUpdate =
  Database["public"]["Tables"]["funeral_contacts"]["Update"];

export function useFuneralContacts(funeralId: string | null) {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  const listQuery = useQuery({
    queryKey: ["funeral-contacts", funeralId],
    enabled: !!funeralId,
    queryFn: async (): Promise<FuneralContact[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_contacts")
        .select("*, client:clients(*)")
        .eq("funeral_id", funeralId!);
      if (error) throw error;
      return (data ?? []) as any;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (
      payload: Omit<FuneralContactInsert, "entrepreneur_id">
    ) => {
      if (!userId) throw new Error("No user");

      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_contacts")
        .insert({ ...payload, entrepreneur_id: userId })
        .select("*")
        .single();
      if (error) throw error;
      return data as FuneralContact;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["funeral-contacts", funeralId],
      }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: FuneralContactUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_contacts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as FuneralContact;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["funeral-contacts", funeralId],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("funeral_contacts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["funeral-contacts", funeralId],
      }),
  });

  return {
    contacts: (listQuery.data ?? []) as any,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    createContact: createMutation.mutateAsync,
    updateContact: updateMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
  };
}
