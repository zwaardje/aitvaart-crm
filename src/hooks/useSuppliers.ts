"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type SupplierInsert = Database["public"]["Tables"]["suppliers"]["Insert"];
type SupplierUpdate = Database["public"]["Tables"]["suppliers"]["Update"];

type SupplierPricelist =
  Database["public"]["Tables"]["supplier_pricelists"]["Row"];
type SupplierPricelistInsert =
  Database["public"]["Tables"]["supplier_pricelists"]["Insert"];
type SupplierPricelistUpdate =
  Database["public"]["Tables"]["supplier_pricelists"]["Update"];

// Extended supplier type with pricelist
type SupplierWithPricelist = Supplier & {
  pricelist: SupplierPricelist[];
};

export function useSuppliers() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  // Get all suppliers for the current user
  const suppliersQuery = useQuery({
    queryKey: ["suppliers"],
    queryFn: async (): Promise<Supplier[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: async (
      supplierData: Omit<SupplierInsert, "entrepreneur_id">
    ) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          ...supplierData,
          entrepreneur_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: SupplierUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("suppliers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  // Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("suppliers").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  return {
    suppliers: suppliersQuery.data ?? [],
    isLoading: suppliersQuery.isLoading,
    error: suppliersQuery.error,
    createSupplier: createSupplierMutation.mutate,
    isCreating: createSupplierMutation.isPending,
    updateSupplier: updateSupplierMutation.mutate,
    isUpdating: updateSupplierMutation.isPending,
    deleteSupplier: deleteSupplierMutation.mutate,
    isDeleting: deleteSupplierMutation.isPending,
    refetch: suppliersQuery.refetch,
  };
}

export function useSupplier(id: string) {
  const queryClient = useQueryClient();

  // Get single supplier with pricelist
  const supplierQuery = useQuery({
    queryKey: ["suppliers", id],
    queryFn: async (): Promise<SupplierWithPricelist | null> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("suppliers")
        .select(
          `
          *,
          pricelist:supplier_pricelists(*)
        `
        )
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

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async (updates: SupplierUpdate) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("suppliers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(
          `
          *,
          pricelist:supplier_pricelists(*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["suppliers", id], data);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  return {
    supplier: supplierQuery.data,
    isLoading: supplierQuery.isLoading,
    error: supplierQuery.error,
    updateSupplier: updateSupplierMutation.mutate,
    isUpdating: updateSupplierMutation.isPending,
    refetch: supplierQuery.refetch,
  };
}

// Hook for supplier pricelist management
export function useSupplierPricelist(supplierId: string) {
  const queryClient = useQueryClient();

  // Get pricelist for a supplier
  const pricelistQuery = useQuery({
    queryKey: ["supplier-pricelist", supplierId],
    queryFn: async (): Promise<SupplierPricelist[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("supplier_pricelists")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("product_name", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!supplierId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Create pricelist item mutation
  const createPricelistItemMutation = useMutation({
    mutationFn: async (
      itemData: Omit<SupplierPricelistInsert, "entrepreneur_id" | "supplier_id">
    ) => {
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("supplier_pricelists")
        .insert({
          ...itemData,
          entrepreneur_id: user.id,
          supplier_id: supplierId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplier-pricelist", supplierId],
      });
    },
  });

  // Update pricelist item mutation
  const updatePricelistItemMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: SupplierPricelistUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("supplier_pricelists")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplier-pricelist", supplierId],
      });
    },
  });

  // Delete pricelist item mutation
  const deletePricelistItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("supplier_pricelists")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplier-pricelist", supplierId],
      });
    },
  });

  return {
    pricelist: pricelistQuery.data ?? [],
    isLoading: pricelistQuery.isLoading,
    error: pricelistQuery.error,
    createPricelistItem: createPricelistItemMutation.mutate,
    isCreating: createPricelistItemMutation.isPending,
    updatePricelistItem: updatePricelistItemMutation.mutate,
    isUpdating: updatePricelistItemMutation.isPending,
    deletePricelistItem: deletePricelistItemMutation.mutate,
    isDeleting: deletePricelistItemMutation.isPending,
    refetch: pricelistQuery.refetch,
  };
}
