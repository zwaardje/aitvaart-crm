"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";
import { useGenericEntity, useSingleEntity } from "./useGenericEntity";
import { Database } from "@/types/database";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];
type FuneralScenarioInsert =
  Database["public"]["Tables"]["funeral_scenarios"]["Insert"];
type FuneralScenarioUpdate =
  Database["public"]["Tables"]["funeral_scenarios"]["Update"];

export function useScenarios(funeralId: string) {
  return useQuery({
    queryKey: ["funeral-scenarios", funeralId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_scenarios")
        .select("*")
        .eq("funeral_id", funeralId)
        .eq("is_active", true)
        .order("section", { ascending: true })
        .order("order_in_section", { ascending: true });

      if (error) throw error;
      return data as FuneralScenario[];
    },
    enabled: !!funeralId,
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  const { create } = useGenericEntity<FuneralScenarioInsert>({
    tableName: "funeral_scenarios",
    enabled: false,
  });

  return useMutation({
    mutationFn: async (data: FuneralScenarioInsert) => {
      const result = await create(data);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["funeral-scenarios", variables.funeral_id],
      });
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();
  const { update } = useGenericEntity<FuneralScenarioUpdate>({
    tableName: "funeral_scenarios",
    enabled: false,
  });

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: FuneralScenarioUpdate;
    }) => {
      const result = await update(id, data);
      return result;
    },
    onSuccess: (_, variables) => {
      // We need to get the funeral_id from the updated scenario
      queryClient.invalidateQueries({
        queryKey: ["funeral-scenarios"],
      });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();
  const { delete: deleteEntity } = useGenericEntity({
    tableName: "funeral_scenarios",
    enabled: false,
  });

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEntity(id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["funeral-scenarios"],
      });
    },
  });
}

// Helper hook for creating scenarios with default values
export function useCreateScenarioWithDefaults() {
  const userId = useCurrentUserId();
  const { mutateAsync: createScenario } = useCreateScenario();

  const createScenarioWithDefaults = async (
    data: Omit<FuneralScenarioInsert, "entrepreneur_id">
  ) => {
    if (!userId) throw new Error("User not authenticated");

    return createScenario({
      ...data,
      entrepreneur_id: userId,
      created_by: userId,
      is_active: true,
      order_in_section: data.order_in_section || 0,
    });
  };

  return { createScenarioWithDefaults };
}

// Hook for fetching a single scenario
export function useScenario(id: string) {
  const entity = useSingleEntity({
    tableName: "funeral_scenarios",
    id,
    select: "*",
  });

  return {
    scenario: entity.data as FuneralScenario | null,
    isLoading: entity.isLoading,
    error: entity.error,
    updateScenario: entity.update,
    isUpdating: entity.isUpdating,
    refetch: entity.refetch,
  };
}
