"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

type FuneralEstimate = Database["public"]["Tables"]["funeral_estimates"]["Row"];
type FuneralEstimateInsert =
  Database["public"]["Tables"]["funeral_estimates"]["Insert"];
type FuneralEstimateUpdate =
  Database["public"]["Tables"]["funeral_estimates"]["Update"];

type FuneralEstimateItem =
  Database["public"]["Tables"]["funeral_estimate_items"]["Row"];
type FuneralEstimateItemInsert =
  Database["public"]["Tables"]["funeral_estimate_items"]["Insert"];
type FuneralEstimateItemUpdate =
  Database["public"]["Tables"]["funeral_estimate_items"]["Update"];

type FuneralFinalInvoice =
  Database["public"]["Tables"]["funeral_final_invoices"]["Row"];
type FuneralFinalInvoiceInsert =
  Database["public"]["Tables"]["funeral_final_invoices"]["Insert"];
type FuneralFinalInvoiceUpdate =
  Database["public"]["Tables"]["funeral_final_invoices"]["Update"];

type FuneralInvoiceItem =
  Database["public"]["Tables"]["funeral_invoice_items"]["Row"];
type FuneralInvoiceItemInsert =
  Database["public"]["Tables"]["funeral_invoice_items"]["Insert"];
type FuneralInvoiceItemUpdate =
  Database["public"]["Tables"]["funeral_invoice_items"]["Update"];

// Extended types with related data
type FuneralEstimateWithItems = FuneralEstimate & {
  items: FuneralEstimateItem[];
};

type FuneralFinalInvoiceWithItems = FuneralFinalInvoice & {
  items: FuneralInvoiceItem[];
};

// ===== ESTIMATES =====

export function useFuneralEstimates(funeralId: string) {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  // Get all estimates for a funeral
  const estimatesQuery = useQuery({
    queryKey: ["funeral-estimates", funeralId],
    queryFn: async (): Promise<FuneralEstimateWithItems[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_estimates")
        .select(
          `
          *,
          items:funeral_estimate_items(*)
        `
        )
        .eq("funeral_id", funeralId)
        .order("version", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!funeralId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Create estimate mutation
  const createEstimateMutation = useMutation({
    mutationFn: async (
      estimateData: Omit<FuneralEstimateInsert, "entrepreneur_id">
    ) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();

      const { data, error } = await supabase
        .from("funeral_estimates")
        .insert({
          ...estimateData,
          entrepreneur_id: userId,
        })
        .select(
          `
          *,
          items:funeral_estimate_items(*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["funeral-estimates", funeralId],
      });
    },
  });

  // Update estimate mutation
  const updateEstimateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: FuneralEstimateUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_estimates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(
          `
          *,
          items:funeral_estimate_items(*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["funeral-estimates", funeralId],
      });
    },
  });

  // Delete estimate mutation
  const deleteEstimateMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("funeral_estimates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["funeral-estimates", funeralId],
      });
    },
  });

  return {
    estimates: estimatesQuery.data ?? [],
    isLoading: estimatesQuery.isLoading,
    error: estimatesQuery.error,
    createEstimate: createEstimateMutation.mutate,
    isCreating: createEstimateMutation.isPending,
    updateEstimate: updateEstimateMutation.mutate,
    isUpdating: updateEstimateMutation.isPending,
    deleteEstimate: deleteEstimateMutation.mutate,
    isDeleting: deleteEstimateMutation.isPending,
    refetch: estimatesQuery.refetch,
  };
}

// Hook for estimate items management
export function useEstimateItems(estimateId: string) {
  const queryClient = useQueryClient();

  // Get items for an estimate
  const itemsQuery = useQuery({
    queryKey: ["estimate-items", estimateId],
    queryFn: async (): Promise<FuneralEstimateItem[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_estimate_items")
        .select("*")
        .eq("estimate_id", estimateId)
        .order("product_name", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!estimateId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Create estimate item mutation
  const createItemMutation = useMutation({
    mutationFn: async (
      itemData: Omit<FuneralEstimateItemInsert, "estimate_id">
    ) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_estimate_items")
        .insert({
          ...itemData,
          estimate_id: estimateId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["estimate-items", estimateId],
      });
      queryClient.invalidateQueries({ queryKey: ["funeral-estimates"] });
    },
  });

  // Update estimate item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: FuneralEstimateItemUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_estimate_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["estimate-items", estimateId],
      });
      queryClient.invalidateQueries({ queryKey: ["funeral-estimates"] });
    },
  });

  // Delete estimate item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("funeral_estimate_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["estimate-items", estimateId],
      });
      queryClient.invalidateQueries({ queryKey: ["funeral-estimates"] });
    },
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    createItem: createItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    updateItem: updateItemMutation.mutate,
    isUpdating: updateItemMutation.isPending,
    deleteItem: deleteItemMutation.mutate,
    isDeleting: deleteItemMutation.isPending,
    refetch: itemsQuery.refetch,
  };
}

// ===== FINAL INVOICES =====

export function useFuneralInvoices(funeralId: string) {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  // Get all invoices for a funeral
  const invoicesQuery = useQuery({
    queryKey: ["funeral-invoices", funeralId],
    queryFn: async (): Promise<FuneralFinalInvoiceWithItems[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_final_invoices")
        .select(
          `
          *,
          items:funeral_invoice_items(*)
        `
        )
        .eq("funeral_id", funeralId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!funeralId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (
      invoiceData: Omit<FuneralFinalInvoiceInsert, "entrepreneur_id">
    ) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();

      const { data, error } = await supabase
        .from("funeral_final_invoices")
        .insert({
          ...invoiceData,
          entrepreneur_id: userId,
        })
        .select(
          `
          *,
          items:funeral_invoice_items(*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["funeral-invoices", funeralId],
      });
    },
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: FuneralFinalInvoiceUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_final_invoices")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(
          `
          *,
          items:funeral_invoice_items(*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["funeral-invoices", funeralId],
      });
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("funeral_final_invoices")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["funeral-invoices", funeralId],
      });
    },
  });

  return {
    invoices: invoicesQuery.data ?? [],
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,
    createInvoice: createInvoiceMutation.mutate,
    isCreating: createInvoiceMutation.isPending,
    updateInvoice: updateInvoiceMutation.mutate,
    isUpdating: updateInvoiceMutation.isPending,
    deleteInvoice: deleteInvoiceMutation.mutate,
    isDeleting: deleteInvoiceMutation.isPending,
    refetch: invoicesQuery.refetch,
  };
}

// Hook for invoice items management
export function useInvoiceItems(invoiceId: string) {
  const queryClient = useQueryClient();

  // Get items for an invoice
  const itemsQuery = useQuery({
    queryKey: ["invoice-items", invoiceId],
    queryFn: async (): Promise<FuneralInvoiceItem[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("product_name", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Create invoice item mutation
  const createItemMutation = useMutation({
    mutationFn: async (
      itemData: Omit<FuneralInvoiceItemInsert, "invoice_id">
    ) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_invoice_items")
        .insert({
          ...itemData,
          invoice_id: invoiceId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-items", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["funeral-invoices"] });
    },
  });

  // Update invoice item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: FuneralInvoiceItemUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_invoice_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-items", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["funeral-invoices"] });
    },
  });

  // Delete invoice item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("funeral_invoice_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-items", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["funeral-invoices"] });
    },
  });

  return {
    items: itemsQuery.data ?? [],
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    createItem: createItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    updateItem: updateItemMutation.mutate,
    isUpdating: updateItemMutation.isPending,
    deleteItem: deleteItemMutation.mutate,
    isDeleting: deleteItemMutation.isPending,
    refetch: itemsQuery.refetch,
  };
}
