"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePermissions,
  usePermissionGroups,
  useRolePermissions,
  useUpdateRolePermissions,
  useUserPermissions,
  useGrantUserPermission,
  useRevokeUserPermission,
} from "@/hooks/usePermissions";
import { useOrganizationMembers } from "@/hooks/useOrganizations";
import type {
  OrganizationRole,
  PermissionDefinition,
} from "@/types/multi-user";
import {
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
  RiShieldLine,
} from "@remixicon/react";

interface PermissionManagerProps {
  organizationId: string;
  userId?: string; // If provided, shows user-specific permissions
}

export function PermissionManager({
  organizationId,
  userId,
}: PermissionManagerProps) {
  const t = useTranslations();
  const [selectedRole, setSelectedRole] = useState<OrganizationRole>("editor");
  const [selectedUser, setSelectedUser] = useState<string | null>(
    userId || null
  );

  // Data hooks
  const { data: permissions = [], isLoading: permissionsLoading } =
    usePermissions();
  const { data: permissionGroups = [] } = usePermissionGroups();
  const { data: rolePermissions = [] } = useRolePermissions(selectedRole);
  const { data: members = [] } = useOrganizationMembers(organizationId);
  const { data: userPermissions = [] } = useUserPermissions(
    selectedUser!,
    organizationId
  );

  // Mutation hooks
  const updateRolePermissions = useUpdateRolePermissions();
  const grantUserPermission = useGrantUserPermission();
  const revokeUserPermission = useRevokeUserPermission();

  // Get permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, PermissionDefinition[]>);

  // Get role permission IDs
  const rolePermissionIds = rolePermissions.map((rp) => rp.permission_id);

  // Handle role permission changes
  const handleRolePermissionChange = async (
    permissionId: string,
    granted: boolean
  ) => {
    const newPermissionIds = granted
      ? [...rolePermissionIds, permissionId]
      : rolePermissionIds.filter((id) => id !== permissionId);

    await updateRolePermissions.mutateAsync({
      role: selectedRole,
      permissionIds: newPermissionIds,
    });
  };

  // Handle user permission changes
  const handleUserPermissionChange = async (
    permissionId: string,
    granted: boolean
  ) => {
    if (!selectedUser) return;

    if (granted) {
      await grantUserPermission.mutateAsync({
        userId: selectedUser,
        organizationId,
        permissionId,
        granted: true,
      });
    } else {
      // Find the user permission to revoke
      const userPermission = userPermissions.find(
        (up) => up.permission_id === permissionId
      );
      if (userPermission) {
        await revokeUserPermission.mutateAsync(userPermission.id);
      }
    }
  };

  if (permissionsLoading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
          <TabsTrigger value="users">User Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiShieldLine className="h-5 w-5" />
                Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Role Selector */}
                <div className="flex gap-2">
                  {(
                    ["owner", "admin", "editor", "viewer"] as OrganizationRole[]
                  ).map((role) => (
                    <Button
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRole(role)}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Permissions by Category */}
                <div className="space-y-6">
                  {Object.entries(permissionsByCategory).map(
                    ([category, categoryPermissions]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-700">
                          {category
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryPermissions.map((permission) => {
                            const isGranted = rolePermissionIds.includes(
                              permission.id
                            );
                            return (
                              <div
                                key={permission.id}
                                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                              >
                                <Checkbox
                                  id={`role-${permission.id}`}
                                  checked={isGranted}
                                  onCheckedChange={(checked) =>
                                    handleRolePermissionChange(
                                      permission.id,
                                      !!checked
                                    )
                                  }
                                  disabled={updateRolePermissions.isPending}
                                />
                                <div className="flex-1 min-w-0">
                                  <label
                                    htmlFor={`role-${permission.id}`}
                                    className="text-sm font-medium text-gray-900 cursor-pointer"
                                  >
                                    {permission.display_name}
                                  </label>
                                  {permission.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                                {permission.is_system_permission && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    System
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiUserLine className="h-5 w-5" />
                User Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  <select
                    value={selectedUser || ""}
                    onChange={(e) => setSelectedUser(e.target.value || null)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a user...</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.user_id}>
                        {member.user?.full_name ||
                          member.user?.company_name ||
                          "Unknown User"}
                        {member.role && ` (${member.role})`}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUser && (
                  <div className="space-y-6">
                    {/* User's Role Permissions */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-3">
                        Role-based Permissions
                      </h4>
                      <div className="text-sm text-gray-600">
                        These permissions are inherited from the user's role and
                        cannot be modified here. To change these, modify the
                        role permissions above.
                      </div>
                    </div>

                    {/* User-specific Permissions */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-3">
                        Additional User Permissions
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(permissionsByCategory).map(
                          ([category, categoryPermissions]) => (
                            <div key={category} className="space-y-2">
                              <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {category
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {categoryPermissions.map((permission) => {
                                  const userPermission = userPermissions.find(
                                    (up) => up.permission_id === permission.id
                                  );
                                  const isGranted =
                                    userPermission?.granted || false;

                                  return (
                                    <div
                                      key={permission.id}
                                      className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50"
                                    >
                                      <Checkbox
                                        id={`user-${permission.id}`}
                                        checked={isGranted}
                                        onCheckedChange={(checked) =>
                                          handleUserPermissionChange(
                                            permission.id,
                                            !!checked
                                          )
                                        }
                                        disabled={
                                          grantUserPermission.isPending ||
                                          revokeUserPermission.isPending
                                        }
                                      />
                                      <div className="flex-1 min-w-0">
                                        <label
                                          htmlFor={`user-${permission.id}`}
                                          className="text-sm font-medium text-gray-900 cursor-pointer"
                                        >
                                          {permission.display_name}
                                        </label>
                                      </div>
                                      {userPermission && (
                                        <div className="flex items-center gap-1">
                                          {userPermission.expires_at && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              Expires:{" "}
                                              {new Date(
                                                userPermission.expires_at
                                              ).toLocaleDateString()}
                                            </Badge>
                                          )}
                                          {userPermission.granted_by_user && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              By:{" "}
                                              {userPermission.granted_by_user
                                                .full_name ||
                                                userPermission.granted_by_user
                                                  .company_name}
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
