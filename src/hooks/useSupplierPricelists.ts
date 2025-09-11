"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

type SupplierPricelist =
  Database["public"]["Tables"]["supplier_pricelists"]["Row"];
type SupplierPricelistInsert =
  Database["public"]["Tables"]["supplier_pricelists"]["Insert"];

// Hook for getting all supplier pricelists (for search)
export function useSupplierPricelists() {
  const pricelistsQuery = useQuery({
    queryKey: ["supplier-pricelists"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("supplier_pricelists")
        .select(
          `
          *,
          supplier:suppliers(*)
        `
        )
        .order("product_name", { ascending: true });

      if (error) throw error;
      return data as (SupplierPricelist & {
        supplier: Database["public"]["Tables"]["suppliers"]["Row"];
      })[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    pricelists: pricelistsQuery.data || [],
    isLoading: pricelistsQuery.isLoading,
    error: pricelistsQuery.error,
    refetch: pricelistsQuery.refetch,
  };
}

// Hook for creating a pricelist item
export function useCreatePricelistItem() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  const createPricelistItem = useMutation({
    mutationFn: async (
      data: Omit<SupplierPricelistInsert, "entrepreneur_id">
    ) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();
      const { data: result, error } = await supabase
        .from("supplier_pricelists")
        .insert({
          ...data,
          entrepreneur_id: userId,
        })
        .select(
          `
          *,
          supplier:suppliers(*)
        `
        )
        .single();

      if (error) throw error;
      return result as SupplierPricelist & {
        supplier: Database["public"]["Tables"]["suppliers"]["Row"];
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-pricelists"] });
    },
  });

  return {
    createPricelistItem: createPricelistItem.mutate,
    isCreating: createPricelistItem.isPending,
    error: createPricelistItem.error,
  };
}
