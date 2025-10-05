"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Database } from "@/types/database";

// Type definitions from database
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];

// Alias for backward compatibility
export type Task = TaskRow;

export interface TaskWithDetails extends Task {
  task_type?: {
    id: string;
    name: string;
    description?: string | null;
    category?: string | null;
    n8n_workflow_id: string;
    is_required: boolean;
    estimated_duration_minutes?: number | null;
    priority: number;
  };
  assigned_to_user?: {
    id: string;
    full_name?: string | null;
    company_name?: string | null;
  };
  funeral?: {
    id: string;
    location?: string | null;
    funeral_director?: string | null;
    deceased?: {
      first_names?: string | null;
      last_name?: string | null;
    };
  };
}

// Hook to fetch tasks for a specific funeral
export function useTasks(funeralId?: string) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["tasks", funeralId],
    queryFn: async () => {
      if (!funeralId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_type:task_types(id, name, description, category, n8n_workflow_id, is_required, estimated_duration_minutes, priority),
          assigned_to_user:assigned_to(full_name, company_name),
          funeral:funerals(id, location, funeral_director, deceased:deceased_id(first_names, last_name))
        `
        )
        .eq("funeral_id", funeralId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as TaskWithDetails[];
    },
    enabled: !!funeralId,
  });
}

// Hook to fetch tasks by status
export function useTasksByStatus(organizationId?: string, status?: TaskStatus) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["tasks", organizationId, "status", status],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from("tasks")
        .select(
          `
          *,
          task_type:task_types(id, name, description, category, n8n_workflow_id, is_required, estimated_duration_minutes, priority),
          assigned_to_user:assigned_to(full_name, company_name),
          funeral:funerals(id, location, funeral_director, deceased:deceased_id(first_names, last_name))
        `
        )
        .eq("organization_id", organizationId);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      return (data || []) as unknown as TaskWithDetails[];
    },
    enabled: !!organizationId,
  });
}

// Hook to fetch assigned tasks for a user
export function useAssignedTasks(userId?: string) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["tasks", "assigned", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_type:task_types(id, name, description, category, n8n_workflow_id, is_required, estimated_duration_minutes, priority),
          funeral:funerals(id, location, funeral_director, deceased:deceased_id(first_names, last_name))
        `
        )
        .eq("assigned_to", userId)
        .in("status", ["todo", "pending"])
        .order("priority", { ascending: false })
        .order("due_date", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as TaskWithDetails[];
    },
    enabled: !!userId,
  });
}

// Hook to fetch overdue tasks
export function useOverdueTasks(organizationId?: string) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["tasks", organizationId, "overdue"],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_type:task_types(id, name, description, category, n8n_workflow_id, is_required, estimated_duration_minutes, priority),
          assigned_to_user:assigned_to(full_name, company_name),
          funeral:funerals(id, location, funeral_director, deceased:deceased_id(first_names, last_name))
        `
        )
        .eq("organization_id", organizationId)
        .lt("due_date", new Date().toISOString())
        .in("status", ["required", "todo", "pending"])
        .order("due_date", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as TaskWithDetails[];
    },
    enabled: !!organizationId,
  });
}

// Hook to fetch task statistics
export function useTaskStatistics(organizationId?: string) {
  const supabase = getSupabaseBrowser();

  return useQuery({
    queryKey: ["task-statistics", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data, error } = await supabase
        .from("task_statistics")
        .select("*")
        .eq("organization_id", organizationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

// Mutation hooks for tasks
export function useCreateTask() {
  const supabase = getSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.funeral_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-statistics"] });
    },
  });
}

export function useUpdateTask() {
  const supabase = getSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: TaskUpdate;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.funeral_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "assigned"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "overdue"] });
    },
  });
}

export function useDeleteTask() {
  const supabase = getSupabaseBrowser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.funeral_id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-statistics"] });
    },
  });
}

// Hook to start a task (change status to pending)
export function useStartTask() {
  const updateMutation = useUpdateTask();

  return useMutation({
    mutationFn: async ({
      taskId,
      n8nExecutionId,
    }: {
      taskId: string;
      n8nExecutionId?: string;
    }) => {
      return updateMutation.mutateAsync({
        id: taskId,
        updates: {
          status: "pending",
          started_at: new Date().toISOString(),
          n8n_execution_id: n8nExecutionId,
        },
      });
    },
  });
}

// Hook to complete a task (change status to done)
export function useCompleteTask() {
  const updateMutation = useUpdateTask();

  return useMutation({
    mutationFn: async ({
      taskId,
      outputData,
    }: {
      taskId: string;
      outputData?: any;
    }) => {
      return updateMutation.mutateAsync({
        id: taskId,
        updates: {
          status: "done",
          completed_at: new Date().toISOString(),
          output_data: outputData,
        },
      });
    },
  });
}

// Hook to fail a task (change status to error)
export function useFailTask() {
  const updateMutation = useUpdateTask();

  return useMutation({
    mutationFn: async ({
      taskId,
      errorMessage,
    }: {
      taskId: string;
      errorMessage: string;
    }) => {
      return updateMutation.mutateAsync({
        id: taskId,
        updates: {
          status: "error",
          failed_at: new Date().toISOString(),
          error_message: errorMessage,
        },
      });
    },
  });
}

// Hook to retry a failed task
export function useRetryTask() {
  const updateMutation = useUpdateTask();

  return useMutation({
    mutationFn: async (taskId: string) => {
      return updateMutation.mutateAsync({
        id: taskId,
        updates: {
          status: "todo",
          retry_count: 1, // This should be incremented, but we'll let the database handle it
          error_message: null,
          failed_at: null,
        },
      });
    },
  });
}

// Hook to assign a task to a user
export function useAssignTask() {
  const updateMutation = useUpdateTask();

  return useMutation({
    mutationFn: async ({
      taskId,
      userId,
      assignedBy,
    }: {
      taskId: string;
      userId: string;
      assignedBy: string;
    }) => {
      return updateMutation.mutateAsync({
        id: taskId,
        updates: {
          assigned_to: userId,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        },
      });
    },
  });
}

// Hook to create tasks from task types for a funeral
export function useCreateTasksFromTypes() {
  const createTaskMutation = useCreateTask();

  return useMutation({
    mutationFn: async ({
      funeralId,
      taskTypeIds,
      assignedTo,
    }: {
      funeralId: string;
      taskTypeIds: string[];
      assignedTo?: string;
    }) => {
      const tasks = taskTypeIds.map(
        (taskTypeId) =>
          ({
            funeral_id: funeralId,
            task_type_id: taskTypeId,
            status: "required" as TaskStatus,
            assigned_to: assignedTo,
          } as TaskInsert)
      );

      const results = await Promise.all(
        tasks.map((task) => createTaskMutation.mutateAsync(task))
      );

      return results;
    },
  });
}
