"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";

// Error types for better error handling
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface UseEntityOptions {
  tableName: string;
  select?: string;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  enabled?: boolean;
  staleTime?: number;
}

export interface UseEntityResult<T = any> {
  data: T[];
  isLoading: boolean;
  error: DatabaseError | null;
  refetch: () => void;
  create: (data: any) => Promise<T>;
  update: (id: string, updates: any) => Promise<T>;
  delete: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useGenericEntity<T = any>(
  options: UseEntityOptions
): UseEntityResult<T> {
  const {
    tableName,
    select = "*",
    orderBy,
    enabled = true,
    staleTime = 60000,
  } = options;
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();
  const isEnabled = enabled && !!userId;

  // Get all entities
  const entitiesQuery = useQuery({
    queryKey: [tableName, { select, orderBy }],
    queryFn: async (): Promise<T[]> => {
      if (!userId) return [] as T[];

      const supabase = getSupabaseBrowser();
      let query = supabase
        .from(tableName as any)
        .select(select)
        .eq("entrepreneur_id", userId);

      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? true,
        });
      }

      const { data, error } = await query;

      if (error) {
        throw {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        } as DatabaseError;
      }

      return (data ?? []) as T[];
    },
    enabled: isEnabled,
    staleTime,
  });

  // Create entity mutation
  const createMutation = useMutation({
    mutationFn: async (entityData: any) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from(tableName as any)
        .insert({
          ...entityData,
          entrepreneur_id: userId,
        })
        .select(select)
        .single();

      if (error) {
        throw {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        } as DatabaseError;
      }

      return data as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });

  // Update entity mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from(tableName as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(select)
        .single();

      if (error) {
        throw {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        } as DatabaseError;
      }

      return data as T;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });

  // Delete entity mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq("id", id);

      if (error) {
        throw {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        } as DatabaseError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });

  return {
    data: entitiesQuery.data ?? [],
    isLoading: entitiesQuery.isLoading,
    error: entitiesQuery.error as DatabaseError | null,
    refetch: entitiesQuery.refetch,
    create: createMutation.mutateAsync,
    update: (id: string, updates: any) =>
      updateMutation.mutateAsync({ id, updates }),
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook for single entity
export interface UseSingleEntityOptions {
  tableName: string;
  id: string;
  select?: string;
  enabled?: boolean;
  staleTime?: number;
}

export interface UseSingleEntityResult<T = any> {
  data: T | null;
  isLoading: boolean;
  error: DatabaseError | null;
  refetch: () => void;
  update: (updates: any) => Promise<T>;
  isUpdating: boolean;
}

export function useSingleEntity<T = any>(
  options: UseSingleEntityOptions
): UseSingleEntityResult<T> {
  const {
    tableName,
    id,
    select = "*",
    enabled = true,
    staleTime = 60000,
  } = options;
  const queryClient = useQueryClient();

  // Get single entity
  const entityQuery = useQuery({
    queryKey: [tableName, id],
    queryFn: async (): Promise<T | null> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from(tableName as any)
        .select(select)
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows returned
        throw {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        } as DatabaseError;
      }

      return data as T;
    },
    enabled: enabled && !!id,
    staleTime,
  });

  // Update entity mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from(tableName as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(select)
        .single();

      if (error) {
        throw {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        } as DatabaseError;
      }

      return data as T;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([tableName, id], data);
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
  });

  return {
    data: entityQuery.data ?? null,
    isLoading: entityQuery.isLoading,
    error: entityQuery.error as DatabaseError | null,
    refetch: entityQuery.refetch,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
