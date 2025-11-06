"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";

type PricelistItemRow =
  Database["public"]["Tables"]["pricelist_items"] extends any
    ? Database["public"]["Tables"]["pricelist_items"]["Row"]
    : never;
type PricelistItemInsert =
  Database["public"]["Tables"]["pricelist_items"] extends any
    ? Database["public"]["Tables"]["pricelist_items"]["Insert"]
    : never;
type PricelistItemUpdate =
  Database["public"]["Tables"]["pricelist_items"] extends any
    ? Database["public"]["Tables"]["pricelist_items"]["Update"]
    : never;

export function usePricelist() {
  const queryClient = useQueryClient();
  const { data } = useCurrentUserOrganization();
  const organizationId = data?.organization?.id;

  const listQuery = useQuery({
    queryKey: ["pricelist", organizationId],
    queryFn: async (): Promise<PricelistItemRow[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("pricelist_items")
        .select("*")
        .order("title", { ascending: true });
      if (error) throw error;
      return (data || []) as PricelistItemRow[];
    },
    enabled: !!organizationId,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: async (
      payload: Omit<PricelistItemInsert, "organization_id">
    ) => {
      const supabase = getSupabaseBrowser();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !organizationId) throw new Error("Not ready");
      const { data, error } = await supabase
        .from("pricelist_items")
        .insert({
          ...payload,
          organization_id: organizationId,
          entrepreneur_id: user.user.id,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as PricelistItemRow;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["pricelist", organizationId],
      }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: PricelistItemUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("pricelist_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as PricelistItemRow;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["pricelist", organizationId],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("pricelist_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["pricelist", organizationId],
      }),
  });

  return {
    items: (listQuery.data || []) as PricelistItemRow[],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    createItem: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateItem: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    refetch: listQuery.refetch,
  };
}
