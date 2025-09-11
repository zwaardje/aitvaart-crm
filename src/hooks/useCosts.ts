"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUserId } from "@/lib/auth-utils";
import { useGenericEntity, useSingleEntity } from "./useGenericEntity";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";

type FuneralSupplier = Database["public"]["Tables"]["funeral_suppliers"]["Row"];
type FuneralSupplierInsert =
  Database["public"]["Tables"]["funeral_suppliers"]["Insert"];
type FuneralSupplierUpdate =
  Database["public"]["Tables"]["funeral_suppliers"]["Update"];

// Extended supplier type with supplier information
type FuneralSupplierWithSupplier = FuneralSupplier & {
  supplier: Database["public"]["Tables"]["suppliers"]["Row"];
};

export function useCosts(funeralId: string) {
  const costsQuery = useQuery({
    queryKey: ["funeral-costs", funeralId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_suppliers")
        .select(
          `
          *,
          supplier:suppliers(*)
        `
        )
        .eq("funeral_id", funeralId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FuneralSupplierWithSupplier[];
    },
    enabled: !!funeralId,
    staleTime: 1000 * 60, // 1 minute
  });

  const {
    create,
    update,
    delete: deleteEntity,
    isCreating,
    isUpdating,
    isDeleting,
  } = useGenericEntity({
    tableName: "funeral_suppliers",
    enabled: false, // We don't need the generic entity for listing
  });

  return {
    costs: costsQuery.data || [],
    isLoading: costsQuery.isLoading,
    error: costsQuery.error,
    createCost: create,
    isCreating,
    updateCost: update,
    isUpdating,
    deleteCost: deleteEntity,
    isDeleting,
    refetch: costsQuery.refetch,
  };
}

export function useCost(id: string) {
  const entity = useSingleEntity({
    tableName: "funeral_suppliers",
    id,
    select: `
      *,
      supplier:suppliers(*)
    `,
  });

  return {
    cost: entity.data as FuneralSupplierWithSupplier | null,
    isLoading: entity.isLoading,
    error: entity.error,
    updateCost: entity.update,
    isUpdating: entity.isUpdating,
    refetch: entity.refetch,
  };
}

// Hook for creating a cost with automatic entrepreneur_id
export function useCreateCost() {
  const userId = useCurrentUserId();

  const createCostWithDefaults = async (
    data: Omit<FuneralSupplierInsert, "entrepreneur_id">
  ) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const supabase = getSupabaseBrowser();
    const { data: result, error } = await supabase
      .from("funeral_suppliers")
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
    return result as FuneralSupplierWithSupplier;
  };

  return { createCostWithDefaults };
}

// Hook for suppliers (for dropdown)
export function useSuppliers() {
  const suppliersQuery = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    suppliers: suppliersQuery.data || [],
    isLoading: suppliersQuery.isLoading,
    error: suppliersQuery.error,
    refetch: suppliersQuery.refetch,
  };
}
