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

export type FuneralContactWithClient = FuneralContact & {
  client: Database["public"]["Tables"]["clients"]["Row"] | null;
};

/**
 * Sorteert contactpersonen: primair contact bovenaan, daarna alfabetisch op naam
 */
export function sortFuneralContacts(
  contacts: FuneralContactWithClient[]
): FuneralContactWithClient[] {
  return [...contacts].sort((a, b) => {
    // Primair contact altijd bovenaan
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;

    // Daarna alfabetisch op naam (preferred_name, fallback naar last_name)
    const nameA = (
      a.client?.preferred_name ||
      a.client?.last_name ||
      ""
    ).toLowerCase();
    const nameB = (
      b.client?.preferred_name ||
      b.client?.last_name ||
      ""
    ).toLowerCase();
    return nameA.localeCompare(nameB, "nl");
  });
}

export function useFuneralContacts(
  funeralId: string | null,
  clientId?: string | null
) {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  const listQuery = useQuery({
    queryKey: ["funeral-contacts", funeralId, clientId],
    enabled: !!funeralId,
    queryFn: async (): Promise<FuneralContact[]> => {
      const supabase = getSupabaseBrowser();
      let query = supabase
        .from("funeral_contacts")
        .select("*, client:clients(*)")
        .eq("funeral_id", funeralId!);

      // Alleen filteren op client_id als deze is opgegeven
      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      const contacts = (data ?? []) as FuneralContactWithClient[];
      return sortFuneralContacts(contacts);
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

// Hook for getting contact name (client person's name)
export function useContactName(contactId: string) {
  return useQuery({
    queryKey: ["contact-name", contactId],
    queryFn: async () => {
      if (
        !contactId ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          contactId
        )
      ) {
        return null;
      }

      try {
        const supabase = getSupabaseBrowser();

        const { data, error } = await supabase
          .from("funeral_contacts")
          .select(
            `
            id,
            client:clients(
              preferred_name,
              last_name
            )
          `
          )
          .eq("id", contactId)
          .single();

        if (error) {
          // If it's an auth error, don't retry
          if (
            error.message?.includes("refresh_token_already_used") ||
            error.message?.includes("Invalid Refresh Token")
          ) {
            console.warn("Auth token error, skipping retry:", error.message);
            return null;
          }
          return null;
        }

        if (!data) {
          return null;
        }

        // Return the client person's name
        if (data.client) {
          return `${data.client.preferred_name} ${data.client.last_name}`.trim();
        }

        return null;
      } catch (error) {
        console.error("Error fetching contact name:", error);
        return null;
      }
    },
    enabled: !!contactId && typeof window !== "undefined", // Only run on client side
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (
        error?.message?.includes("refresh_token_already_used") ||
        error?.message?.includes("Invalid Refresh Token")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
