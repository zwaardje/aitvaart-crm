"use client";

import { useGenericEntity, useSingleEntity } from "./useGenericEntity";
import type { Database } from "@/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export function useClients() {
  const entity = useGenericEntity({
    tableName: "clients",
    orderBy: { column: "created_at", ascending: false },
  });

  return {
    clients: entity.data,
    isLoading: entity.isLoading,
    error: entity.error,
    createClient: entity.create,
    isCreating: entity.isCreating,
    updateClient: entity.update,
    isUpdating: entity.isUpdating,
    deleteClient: entity.delete,
    isDeleting: entity.isDeleting,
    refetch: entity.refetch,
  };
}

export function useClient(id: string) {
  const entity = useSingleEntity({
    tableName: "clients",
    id,
  });

  return {
    client: entity.data,
    isLoading: entity.isLoading,
    error: entity.error,
    updateClient: entity.update,
    isUpdating: entity.isUpdating,
    refetch: entity.refetch,
  };
}
