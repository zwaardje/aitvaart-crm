"use client";

import { useQuery } from "@tanstack/react-query";
import { useGenericEntity, useSingleEntity } from "./useGenericEntity";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";

type Funeral = Database["public"]["Tables"]["funerals"]["Row"];
type FuneralInsert = Database["public"]["Tables"]["funerals"]["Insert"];
type FuneralUpdate = Database["public"]["Tables"]["funerals"]["Update"];

// Extended funeral type with related data
type FuneralWithRelations = Funeral & {
  client: Database["public"]["Tables"]["clients"]["Row"];
  deceased: Database["public"]["Tables"]["deceased"]["Row"];
};

export function useFunerals() {
  const entity = useGenericEntity({
    tableName: "funerals",
    select: `
      *,
      client:clients(*),
      deceased:deceased(*)
    `,
    orderBy: { column: "created_at", ascending: false },
    enabled: typeof window !== "undefined", // Only run on client side
  });

  return {
    funerals: entity.data as FuneralWithRelations[],
    isLoading: entity.isLoading,
    error: entity.error,
    createFuneral: entity.create,
    isCreating: entity.isCreating,
    updateFuneral: entity.update,
    isUpdating: entity.isUpdating,
    deleteFuneral: entity.delete,
    isDeleting: entity.isDeleting,
    refetch: entity.refetch,
  };
}

export function useFuneral(id: string) {
  const entity = useSingleEntity({
    tableName: "funerals",
    id,
    select: `
      *,
      client:clients(*),
      deceased:deceased(*)
    `,
    enabled: typeof window !== "undefined", // Only run on client side
  });

  return {
    funeral: entity.data as FuneralWithRelations | null,
    isLoading: entity.isLoading,
    error: entity.error,
    updateFuneral: entity.update,
    isUpdating: entity.isUpdating,
    refetch: entity.refetch,
  };
}

// Hook for funeral costs (using the view)
export function useFuneralCosts(funeralId: string) {
  const costsQuery = useQuery({
    queryKey: ["funeral-costs", funeralId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_costs")
        .select("*")
        .eq("funeral_id", funeralId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows returned
        throw error;
      }
      return data;
    },
    enabled: !!funeralId,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    costs: costsQuery.data,
    isLoading: costsQuery.isLoading,
    error: costsQuery.error,
    refetch: costsQuery.refetch,
  };
}

// Hook for funeral cost breakdown (detailed view)
export function useFuneralCostBreakdown(funeralId: string) {
  const breakdownQuery = useQuery({
    queryKey: ["funeral-cost-breakdown", funeralId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_cost_breakdown")
        .select("*")
        .eq("funeral_id", funeralId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!funeralId,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    breakdown: breakdownQuery.data ?? [],
    isLoading: breakdownQuery.isLoading,
    error: breakdownQuery.error,
    refetch: breakdownQuery.refetch,
  };
}

// Hook for getting funeral name (deceased person's name)
export function useFuneralName(funeralId: string) {
  return useQuery({
    queryKey: ["funeral-name", funeralId],
    queryFn: async () => {
      if (
        !funeralId ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          funeralId
        )
      ) {
        return null;
      }

      try {
        const supabase = getSupabaseBrowser();

        const { data, error } = await supabase
          .from("funerals")
          .select(
            `
          id,
          deceased:deceased(
            preferred_name,
            last_name
          )
        `
          )
          .eq("id", funeralId)
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

        // Return the deceased person's name
        if (data.deceased) {
          return `${data.deceased.preferred_name} ${data.deceased.last_name}`.trim();
        }

        return null;
      } catch (error) {
        console.error("Error fetching funeral name:", error);
        return null;
      }
    },
    enabled: !!funeralId && typeof window !== "undefined", // Only run on client side
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
