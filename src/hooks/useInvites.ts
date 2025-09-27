"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Note: Using Supabase native invites, no custom organization_invites table

export interface InviteData {
  id: string;
  organization_id: string;
  invited_by: string;
  invited_email: string;
  token: string;
  role: string;
  status: string;
  can_manage_users: boolean;
  can_manage_funerals: boolean;
  can_manage_clients: boolean;
  can_manage_suppliers: boolean;
  can_view_financials: boolean;
  can_manage_settings: boolean;
  expires_at: string;
  accepted_at: string | null;
  declined_at: string | null;
  accepted_by: string | null;
  email_sent_at: string | null;
  email_opened_at: string | null;
  email_clicked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SendInviteData {
  organizationId: string;
  email: string;
  role: string;
  permissions: {
    can_manage_users: boolean;
    can_manage_funerals: boolean;
    can_manage_clients: boolean;
    can_manage_suppliers: boolean;
    can_view_financials: boolean;
    can_manage_settings: boolean;
  };
}

// ============================================
// INVITE MANAGEMENT
// ============================================

export function useOrganizationInvites(organizationId: string) {
  return useQuery({
    queryKey: ["organization-invites", organizationId],
    queryFn: async () => {
      // Since we're using Supabase native invites, we don't need custom tracking
      // This hook is kept for compatibility but returns empty array
      return [];
    },
    enabled: !!organizationId,
  });
}

export function useSendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendInviteData) => {
      const response = await fetch("/api/invites/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invite");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organization-invites", variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations", variables.organizationId, "members"],
      });
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      role: string;
      permissions?: any;
    }) => {
      const response = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to accept invite");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all organization-related queries
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({
        queryKey: ["current-user-organization"],
      });
    },
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      // Since we're using Supabase native invites, declining is handled by Supabase
      // This is a placeholder for compatibility
      console.log("Decline invite:", inviteId);
      return {
        success: true,
        message: "Invite declined (handled by Supabase)",
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-invites"] });
    },
  });
}

export function useValidateInvite(organizationId: string, role: string) {
  return useQuery({
    queryKey: ["invite-validate", organizationId, role],
    queryFn: async () => {
      const response = await fetch(
        `/api/invites/validate?organization=${organizationId}&role=${role}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Invalid invite");
      }

      return response.json();
    },
    enabled: !!organizationId && !!role,
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      // Since we're using Supabase native invites, cancellation is handled by Supabase
      // This is a placeholder for compatibility
      console.log("Cancel invite:", inviteId);
    },
    onSuccess: (_, inviteId) => {
      queryClient.invalidateQueries({ queryKey: ["organization-invites"] });
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      // Since we're using Supabase native invites, resending is handled by Supabase
      // This is a placeholder for compatibility
      console.log("Resend invite:", inviteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-invites"] });
    },
  });
}

// ============================================
// INVITE STATISTICS
// ============================================

export function useInviteStats(organizationId: string) {
  return useQuery({
    queryKey: ["invite-stats", organizationId],
    queryFn: async () => {
      // Since we're using Supabase native invites, we don't have custom stats
      // Return default stats for compatibility
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        declined: 0,
        expired: 0,
      };
    },
    enabled: !!organizationId,
  });
}
