"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Database } from "@/types/database";

// Type definitions from database
export type TaskTypeRow = Database["public"]["Tables"]["task_types"]["Row"];
export type TaskTypeInsert =
  Database["public"]["Tables"]["task_types"]["Insert"];
export type TaskTypeUpdate =
  Database["public"]["Tables"]["task_types"]["Update"];

// Alias for backward compatibility
export type TaskType = TaskTypeRow;

// Hook to fetch all task types for an organization
export function useTaskTypes(organizationId?: string) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["task-types", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("task_types")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return (data || []) as TaskTypeRow[];
    },
    enabled: !!organizationId,
  });
}

// Hook to fetch a single task type
export function useTaskType(taskTypeId: string) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["task-type", taskTypeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_types" as any)
        .select("*")
        .eq("id", taskTypeId)
        .single();

      if (error) throw error;
      return data as unknown as TaskType;
    },
    enabled: !!taskTypeId,
  });
}

// Hook to fetch task types by category
export function useTaskTypesByCategory(
  organizationId?: string,
  category?: string
) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["task-types", organizationId, "category", category],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from("task_types")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return (data || []) as TaskType[];
    },
    enabled: !!organizationId,
  });
}

// Hook to fetch required task types
export function useRequiredTaskTypes(organizationId?: string) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["task-types", organizationId, "required"],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("task_types")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .eq("is_required", true)
        .order("priority", { ascending: false });

      if (error) throw error;
      return (data || []) as TaskType[];
    },
    enabled: !!organizationId,
  });
}

// Mutation hooks for task types
export function useCreateTaskType() {
  const supabase = getSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskType: TaskTypeInsert) => {
      const { data, error } = await supabase
        .from("task_types")
        .insert(taskType)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TaskType;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["task-types", data.organization_id],
      });
      queryClient.invalidateQueries({ queryKey: ["task-types"] });
    },
  });
}

export function useUpdateTaskType() {
  const supabase = getSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: TaskTypeUpdate;
    }) => {
      const { data, error } = await supabase
        .from("task_types")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TaskType;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["task-type", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["task-types", data.organization_id],
      });
      queryClient.invalidateQueries({ queryKey: ["task-types"] });
    },
  });
}

export function useDeleteTaskType() {
  const supabase = getSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskTypeId: string) => {
      const { data, error } = await supabase
        .from("task_types")
        .delete()
        .eq("id", taskTypeId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as TaskType;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["task-type", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["task-types", data.organization_id],
      });
      queryClient.invalidateQueries({ queryKey: ["task-types"] });
    },
  });
}

// Hook to deactivate a task type (soft delete)
export function useDeactivateTaskType() {
  const updateMutation = useUpdateTaskType();

  return useMutation({
    mutationFn: async (taskTypeId: string) => {
      return updateMutation.mutateAsync({
        id: taskTypeId,
        updates: { is_active: false },
      });
    },
  });
}

// Hook to get task type categories
export function useTaskTypeCategories(organizationId?: string) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["task-type-categories", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("task_types")
        .select("category")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .not("category", "is", null);

      if (error) throw error;

      // Extract unique categories
      const categories = Array.from(
        new Set(data?.map((item) => item.category).filter(Boolean))
      );
      return categories as string[];
    },
    enabled: !!organizationId,
  });
}
