"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUserId } from "@/lib/auth-utils";
import { useGenericEntity, useSingleEntity } from "./useGenericEntity";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";

type FuneralNote = Database["public"]["Tables"]["funeral_notes"]["Row"];
type FuneralNoteInsert =
  Database["public"]["Tables"]["funeral_notes"]["Insert"];
type FuneralNoteUpdate =
  Database["public"]["Tables"]["funeral_notes"]["Update"];

// Extended note type with creator information
type FuneralNoteWithCreator = FuneralNote & {
  creator: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

export function useNotes(funeralId: string) {
  const notesQuery = useQuery({
    queryKey: ["funeral-notes", funeralId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_notes")
        .select(
          `
          *,
          creator:profiles!funeral_notes_created_by_fkey(*)
        `
        )
        .eq("funeral_id", funeralId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FuneralNoteWithCreator[];
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
    tableName: "funeral_notes",
    enabled: false, // We don't need the generic entity for listing
  });

  return {
    notes: notesQuery.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    createNote: create,
    isCreating,
    updateNote: update,
    isUpdating,
    deleteNote: deleteEntity,
    isDeleting,
    refetch: notesQuery.refetch,
  };
}

export function useNote(id: string) {
  const entity = useSingleEntity({
    tableName: "funeral_notes",
    id,
    select: `
      *,
      creator:profiles!funeral_notes_created_by_fkey(*)
    `,
  });

  return {
    note: entity.data as FuneralNoteWithCreator | null,
    isLoading: entity.isLoading,
    error: entity.error,
    updateNote: entity.update,
    isUpdating: entity.isUpdating,
    refetch: entity.refetch,
  };
}

// Hook for creating a note with automatic entrepreneur_id and created_by
export function useCreateNote() {
  const userId = useCurrentUserId();

  const createNoteWithDefaults = async (
    data: Omit<FuneralNoteInsert, "entrepreneur_id" | "created_by">
  ) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const supabase = getSupabaseBrowser();
    const { data: result, error } = await supabase
      .from("funeral_notes")
      .insert({
        ...data,
        entrepreneur_id: userId,
        created_by: userId,
      })
      .select(
        `
        *,
        creator:profiles!funeral_notes_created_by_fkey(*)
      `
      )
      .single();

    if (error) throw error;
    return result as FuneralNoteWithCreator;
  };

  return { createNoteWithDefaults };
}
