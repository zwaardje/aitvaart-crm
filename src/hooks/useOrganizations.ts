"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";
import type {
  Organization,
  OrganizationMember,
  OrganizationInvite,
} from "@/types/multi-user";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationMemberRow =
  Database["public"]["Tables"]["organization_members"]["Row"];

// ============================================
// ORGANIZATIONS
// ============================================

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrganizationRow[];
    },
  });
}

export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      if (error) throw error;
      return data as OrganizationRow;
    },
    enabled: !!organizationId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Organization>) => {
      const supabase = getSupabaseBrowser();
      const { data: result, error } = await supabase
        .from("organizations")
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result as OrganizationRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Organization> & { id: string }) => {
      const supabase = getSupabaseBrowser();
      const { data: result, error } = await supabase
        .from("organizations")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result as OrganizationRow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({
        queryKey: ["organizations", variables.id],
      });
    },
  });
}

// ============================================
// ORGANIZATION MEMBERS
// ============================================

export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: ["organizations", organizationId, "members"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("organization_members")
        .select(
          `
          *,
          user:profiles!organization_members_user_id_fkey(
            id,
            full_name,
            company_name,
            avatar_url
          )
        `
        )
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrganizationMemberRow[];
    },
    enabled: !!organizationId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      email,
      role,
      permissions,
    }: OrganizationInvite) => {
      const response = await fetch("/api/invites/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          email,
          role,
          permissions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invite");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organizations", variables.organizationId, "members"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-invites", variables.organizationId],
      });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      role,
      permissions,
    }: {
      id: string;
      role?: string;
      permissions?: Partial<OrganizationMember>;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("organization_members")
        .update({ role, ...permissions })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as OrganizationMemberRow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

// ============================================
// USER PERMISSIONS
// ============================================

export function useCurrentUserRole(organizationId?: string) {
  return useQuery({
    queryKey: ["current-user-role", organizationId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("organization_members")
        .select(
          `
          role,
          can_manage_users,
          can_manage_funerals,
          can_manage_clients,
          can_manage_suppliers,
          can_view_financials,
          can_manage_settings
        `
        )
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id!)
        .eq("organization_id", organizationId!)
        .eq("status", "active")
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useCurrentUserOrganization() {
  return useQuery({
    queryKey: ["current-user-organization"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from("organization_members")
        .select(
          `
          *,
          organization:organizations(*)
        `
        )
        .eq("user_id", user.user.id)
        .eq("status", "active")
        .single();

      if (error) throw error;
      return data;
    },
  });
}
