"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { GenericCard } from "@/components/ui/GenericCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useOrganizationMembers,
  useInviteMember,
  useUpdateMember,
  useRemoveMember,
} from "@/hooks/useOrganizations";
import { useOrganizationInvites, useInviteStats } from "@/hooks/useInvites";
import { usePermissions } from "@/hooks/usePermissions";
import type { OrganizationRole, MemberStatus } from "@/types/multi-user";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiUserLine,
  RiMailLine,
  RiCheckLine,
} from "@remixicon/react";

interface UserManagerProps {
  organizationId: string;
}

interface InviteUserForm {
  email: string;
  role: OrganizationRole;
  permissions: {
    can_manage_users: boolean;
    can_manage_funerals: boolean;
    can_manage_clients: boolean;
    can_manage_suppliers: boolean;
    can_view_financials: boolean;
    can_manage_settings: boolean;
  };
}

export function UserManager({ organizationId }: UserManagerProps) {
  const t = useTranslations();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteForm, setInviteForm] = useState<InviteUserForm>({
    email: "",
    role: "editor",
    permissions: {
      can_manage_users: false,
      can_manage_funerals: true,
      can_manage_clients: true,
      can_manage_suppliers: true,
      can_view_financials: false,
      can_manage_settings: false,
    },
  });

  // Data hooks
  const { data: members = [], isLoading } =
    useOrganizationMembers(organizationId);

  // Mutation hooks
  const inviteMember = useInviteMember();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;

    return members.filter((member) => {
      const fullName = (member as any).full_name || "";
      const companyName = (member as any).company_name || "";
      const email = (member as any).email || "";
      const role = member.role || "";

      const searchLower = searchQuery.toLowerCase();
      return (
        fullName.toLowerCase().includes(searchLower) ||
        companyName.toLowerCase().includes(searchLower) ||
        email.toLowerCase().includes(searchLower) ||
        role.toLowerCase().includes(searchLower)
      );
    });
  }, [members, searchQuery]);

  // Handle invite submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteMember.mutateAsync({
        organizationId,
        email: inviteForm.email,
        role: inviteForm.role,
        permissions: inviteForm.permissions,
        invited_by: "current-user", // This will be set by the backend
      });
      setIsInviteOpen(false);
      setInviteForm({
        email: "",
        role: "editor",
        permissions: {
          can_manage_users: false,
          can_manage_funerals: true,
          can_manage_clients: true,
          can_manage_suppliers: true,
          can_view_financials: false,
          can_manage_settings: false,
        },
      });
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  // Handle member update
  const handleUpdateMember = async (
    memberId: string,
    updates: Partial<InviteUserForm>
  ) => {
    try {
      await updateMember.mutateAsync({ id: memberId, ...updates });
      setEditingMember(null);
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  // Handle member removal
  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      try {
        await removeMember.mutateAsync(memberId);
      } catch (error) {
        console.error("Error removing member:", error);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <GenericCard
        title="Loading..."
        subtitle="Loading team members..."
        content={
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Section */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="default">
              <RiAddLine className="h-4 w-4" />
              Toevoegen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value: OrganizationRole) =>
                    setInviteForm((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(inviteForm.permissions).map(
                    ([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setInviteForm((prev) => ({
                              ...prev,
                              permissions: {
                                ...prev.permissions,
                                [key]: e.target.checked,
                              },
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">
                          {key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteMember.isPending}>
                  {inviteMember.isPending ? "Inviting..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <GenericCard
            key={member.id}
            title={
              (member as any).full_name ||
              (member as any).company_name ||
              "Unknown User"
            }
            subtitle={(member as any).email || "No email available"}
            content={
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <RiUserLine className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    User ID: {member.user_id}
                  </p>
                </div>
              </div>
            }
            actions={
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingMember(member.id)}
                >
                  <RiEditLine className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <RiDeleteBinLine className="h-4 w-4" />
                </Button>
              </div>
            }
            footer={
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(member.role as any)}>
                  {member.role}
                </Badge>
                <Badge className={getStatusColor(member.status as any)}>
                  {member.status}
                </Badge>
              </div>
            }
          />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <GenericCard
          title="No team members found"
          subtitle={
            searchQuery
              ? "Try adjusting your search criteria"
              : "No members in this organization"
          }
          content={
            <div className="text-center py-8">
              <RiUserLine className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            </div>
          }
        />
      )}
    </div>
  );
}
