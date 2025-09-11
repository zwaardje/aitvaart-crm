"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUserId } from "@/lib/auth-utils";
import type { Database } from "@/types/database";

type CompanyBranding = Database["public"]["Tables"]["company_branding"]["Row"];
type CompanyBrandingInsert =
  Database["public"]["Tables"]["company_branding"]["Insert"];
type CompanyBrandingUpdate =
  Database["public"]["Tables"]["company_branding"]["Update"];

export function useCompanyBranding() {
  const queryClient = useQueryClient();
  const userId = useCurrentUserId();

  // Get company branding for the current user
  const brandingQuery = useQuery({
    queryKey: ["company-branding"],
    queryFn: async (): Promise<CompanyBranding | null> => {
      if (!userId) return null;

      const supabase = getSupabaseBrowser();

      const { data, error } = await supabase
        .from("company_branding")
        .select("*")
        .eq("entrepreneur_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // No rows returned
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create company branding mutation
  const createBrandingMutation = useMutation({
    mutationFn: async (
      brandingData: Omit<CompanyBrandingInsert, "entrepreneur_id">
    ) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();

      const { data, error } = await supabase
        .from("company_branding")
        .insert({
          ...brandingData,
          entrepreneur_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-branding"] });
    },
  });

  // Update company branding mutation
  const updateBrandingMutation = useMutation({
    mutationFn: async (updates: CompanyBrandingUpdate) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();

      const { data, error } = await supabase
        .from("company_branding")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("entrepreneur_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-branding"] });
    },
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();

      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/branding/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("company-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("company-assets").getPublicUrl(filePath);

      // Update branding with logo URL
      const { data, error } = await supabase
        .from("company_branding")
        .upsert({
          entrepreneur_id: userId,
          logo_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-branding"] });
    },
  });

  // Upload letterhead template mutation
  const uploadLetterheadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("No user logged in");

      const supabase = getSupabaseBrowser();

      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `letterhead-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/branding/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("company-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("company-assets").getPublicUrl(filePath);

      // Update branding with letterhead URL
      const { data, error } = await supabase
        .from("company_branding")
        .upsert({
          entrepreneur_id: userId,
          letterhead_template_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-branding"] });
    },
  });

  return {
    branding: brandingQuery.data,
    isLoading: brandingQuery.isLoading,
    error: brandingQuery.error,
    createBranding: createBrandingMutation.mutate,
    isCreating: createBrandingMutation.isPending,
    updateBranding: updateBrandingMutation.mutate,
    isUpdating: updateBrandingMutation.isPending,
    uploadLogo: uploadLogoMutation.mutate,
    isUploadingLogo: uploadLogoMutation.isPending,
    uploadLetterhead: uploadLetterheadMutation.mutate,
    isUploadingLetterhead: uploadLetterheadMutation.isPending,
    refetch: brandingQuery.refetch,
  };
}
