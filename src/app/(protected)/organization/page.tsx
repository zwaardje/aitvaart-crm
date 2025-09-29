import React from "react";
import { useTranslations } from "next-intl";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManager } from "@/components/organization/UserManager";
import { PermissionManager } from "@/components/organization/PermissionManager";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import {
  RiUserLine,
  RiShieldLine,
  RiBuildingLine,
  RiSettingsLine,
} from "@remixicon/react";

export default function OrganizationPage() {
  const t = useTranslations();
  const { data: userOrganization, isLoading } = useCurrentUserOrganization();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userOrganization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <RiBuildingLine className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Organization Found
            </h2>
            <p className="text-gray-500">
              You are not a member of any organization. Please contact your
              administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {userOrganization.organization?.name || "Organization"}
        </h1>
        <p className="text-gray-600">
          Manage your organization settings, members, and permissions
        </p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <RiUserLine className="h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <RiShieldLine className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <RiSettingsLine className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <RiBuildingLine className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <UserManager organizationId={userOrganization.organization_id} />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionManager
            organizationId={userOrganization.organization_id}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Organization Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name
                      </label>
                      <p className="text-sm text-gray-900">
                        {userOrganization.organization?.name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan Type
                      </label>
                      <p className="text-sm text-gray-900">
                        {userOrganization.organization?.plan_type || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Users
                      </label>
                      <p className="text-sm text-gray-900">
                        {userOrganization.organization?.max_users || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <p className="text-sm text-gray-900">
                        {userOrganization.organization?.is_active
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Billing Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Email
                      </label>
                      <p className="text-sm text-gray-900">
                        {userOrganization.organization?.billing_email ||
                          "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Billing Address
                      </label>
                      <p className="text-sm text-gray-900">
                        {userOrganization.organization?.billing_address ||
                          "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
