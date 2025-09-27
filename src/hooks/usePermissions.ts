"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";
import type { Permission, OrganizationRole } from "@/types/multi-user";

export interface PermissionDefinition {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  is_system_permission: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type PermissionRow = Database["public"]["Tables"]["permissions"]["Row"];
type RolePermissionRow =
  Database["public"]["Tables"]["role_permissions"]["Row"];
type UserPermissionRow =
  Database["public"]["Tables"]["user_permissions"]["Row"];
type PermissionGroupRow =
  Database["public"]["Tables"]["permission_groups"]["Row"];

// ============================================
// PERMISSIONS
// ============================================

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("display_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function usePermissionsByCategory() {
  return useQuery({
    queryKey: ["permissions", "by-category"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("display_name", { ascending: true });

      if (error) throw error;

      // Group by category
      const grouped = data.reduce(
        (acc: Record<string, any[]>, permission: any) => {
          if (!acc[permission.category]) {
            acc[permission.category] = [];
          }
          acc[permission.category].push(permission);
          return acc;
        },
        {} as Record<string, any[]>
      );

      return grouped;
    },
  });
}

// ============================================
// PERMISSION GROUPS
// ============================================

export function usePermissionGroups() {
  return useQuery({
    queryKey: ["permission-groups"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("permission_groups")
        .select(
          `
          *,
          permissions:permission_group_memberships(
            permission:permissions(*)
          )
        `
        )
        .eq("is_active", true)
        .order("display_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// ============================================
// ROLE PERMISSIONS
// ============================================

export function useRolePermissions(role: OrganizationRole) {
  return useQuery({
    queryKey: ["role-permissions", role],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("role_permissions")
        .select(
          `
          *,
          permission:permissions(*)
        `
        )
        .eq("role", role);

      if (error) throw error;
      return data;
    },
    enabled: !!role,
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      role,
      permissionIds,
    }: {
      role: OrganizationRole;
      permissionIds: string[];
    }) => {
      const supabase = getSupabaseBrowser();

      // Delete existing permissions for this role
      const { error: deleteError } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role", role);

      if (deleteError) throw deleteError;

      // Insert new permissions
      if (permissionIds.length > 0) {
        const { error: insertError } = await supabase
          .from("role_permissions")
          .insert(
            permissionIds.map((permissionId) => ({
              role,
              permission_id: permissionId,
            }))
          );

        if (insertError) throw insertError;
      }

      return { role, permissionIds };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["role-permissions", variables.role],
      });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    },
  });
}

// ============================================
// USER PERMISSIONS
// ============================================

export function useUserPermissions(userId: string, organizationId: string) {
  return useQuery({
    queryKey: ["user-permissions", userId, organizationId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("user_permissions")
        .select(
          `
          *,
          permission:permissions(*),
          granted_by_user:profiles!user_permissions_granted_by_fkey(
            id,
            full_name,
            company_name
          )
        `
        )
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!organizationId,
  });
}

export function useGrantUserPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      organizationId,
      permissionId,
      granted = true,
      context = null,
      expiresAt = null,
    }: {
      userId: string;
      organizationId: string;
      permissionId: string;
      granted?: boolean;
      context?: string | null;
      expiresAt?: string | null;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("user_permissions")
        .upsert({
          user_id: userId,
          organization_id: organizationId,
          permission_id: permissionId,
          granted,
          context,
          expires_at: expiresAt,
          granted_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "user-permissions",
          variables.userId,
          variables.organizationId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    },
  });
}

export function useRevokeUserPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("user_permissions")
        .delete()
        .eq("id", permissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    },
  });
}

// ============================================
// CURRENT USER PERMISSIONS
// ============================================

export function useCurrentUserPermissions(organizationId?: string) {
  return useQuery({
    queryKey: ["current-user-permissions", organizationId],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      // Get user's organization if not provided
      let orgId = organizationId;
      if (!orgId) {
        const { data: membership } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.user.id)
          .eq("status", "active")
          .single();

        orgId = membership?.organization_id;
      }

      if (!orgId) return null;

      // Get all permissions for this user
      const { data, error } = await supabase.rpc("get_user_permissions", {
        user_uuid: user.user.id,
        organization_uuid: orgId,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

// ============================================
// PERMISSION CHECKING
// ============================================

export function useHasPermission(
  permissionName: string,
  organizationId?: string,
  context?: string
) {
  return useQuery({
    queryKey: ["has-permission", permissionName, organizationId, context],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data, error } = await supabase.rpc("user_has_permission", {
        user_uuid: user.user.id,
        permission_name: permissionName,
        organization_uuid: organizationId || undefined,
        context: context || undefined,
      });

      if (error) throw error;
      return data as boolean;
    },
    enabled: !!permissionName,
  });
}

// ============================================
// PERMISSION BATCH CHECKING
// ============================================

export function useHasPermissions(
  permissionNames: string[],
  organizationId?: string,
  context?: string
) {
  return useQuery({
    queryKey: ["has-permissions", permissionNames, organizationId, context],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return {};

      const results: Record<string, boolean> = {};

      // Check each permission
      for (const permissionName of permissionNames) {
        const { data, error } = await supabase.rpc("user_has_permission", {
          user_uuid: user.user.id,
          permission_name: permissionName,
          organization_uuid: organizationId || undefined,
          context: context || undefined,
        });

        if (error) throw error;
        results[permissionName] = data as boolean;
      }

      return results;
    },
    enabled: permissionNames.length > 0,
  });
}

// ============================================
// PERMISSION UTILITIES
// ============================================

export function usePermissionCategories() {
  return useQuery({
    queryKey: ["permission-categories"],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("permissions")
        .select("category")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) throw error;

      // Get unique categories
      const categories = Array.from(new Set(data.map((p: any) => p.category)));
      return categories;
    },
  });
}

export function usePermissionsByRole(role: OrganizationRole) {
  return useQuery({
    queryKey: ["permissions-by-role", role],
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("role_permissions")
        .select(
          `
          permission:permissions(*)
        `
        )
        .eq("role", role);

      if (error) throw error;
      return data.map((rp: any) => rp.permission);
    },
    enabled: !!role,
  });
}
