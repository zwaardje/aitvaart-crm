"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

export function useDocuments(funeralId: string) {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  // Get all documents for a funeral
  const documentsQuery = useQuery({
    queryKey: ["documents", funeralId],
    queryFn: async (): Promise<Document[]> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("funeral_id", funeralId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!funeralId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({
      file,
      description,
    }: {
      file: File;
      description?: string;
    }) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();

      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${userId}/${funeralId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("funeral-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("funeral-documents").getPublicUrl(filePath);

      // Create document record
      const { data, error } = await supabase
        .from("documents")
        .insert({
          entrepreneur_id: userId,
          funeral_id: funeralId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", funeralId] });
    },
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: DocumentUpdate;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("documents")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", funeralId] });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();

      // First get the document to find the storage path
      const { data: document, error: fetchError } = await supabase
        .from("documents")
        .select("storage_path")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (document.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("funeral-documents")
          .remove([document.storage_path]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error } = await supabase.from("documents").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", funeralId] });
    },
  });

  // Get document download URL
  const getDownloadUrl = async (document: Document): Promise<string> => {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.storage
      .from("funeral-documents")
      .createSignedUrl(document.storage_path, 3600); // 1 hour expiry

    return data?.signedUrl || "";
  };

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    uploadDocument: uploadDocumentMutation.mutate,
    isUploading: uploadDocumentMutation.isPending,
    updateDocument: updateDocumentMutation.mutate,
    isUpdating: updateDocumentMutation.isPending,
    deleteDocument: deleteDocumentMutation.mutate,
    isDeleting: deleteDocumentMutation.isPending,
    getDownloadUrl,
    refetch: documentsQuery.refetch,
  };
}

export function useDocument(id: string) {
  const queryClient = useQueryClient();

  // Get single document
  const documentQuery = useQuery({
    queryKey: ["documents", "single", id],
    queryFn: async (): Promise<Document | null> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("documents")
        .select("*")
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

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async (updates: DocumentUpdate) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("documents")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["documents", "single", id], data);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  // Get document download URL
  const getDownloadUrl = async (): Promise<string> => {
    if (!documentQuery.data) return "";

    const supabase = getSupabaseBrowser();
    const { data } = await supabase.storage
      .from("funeral-documents")
      .createSignedUrl(documentQuery.data.storage_path, 3600); // 1 hour expiry

    return data?.signedUrl || "";
  };

  return {
    document: documentQuery.data,
    isLoading: documentQuery.isLoading,
    error: documentQuery.error,
    updateDocument: updateDocumentMutation.mutate,
    isUpdating: updateDocumentMutation.isPending,
    getDownloadUrl,
    refetch: documentQuery.refetch,
  };
}
