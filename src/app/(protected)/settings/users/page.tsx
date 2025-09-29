"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { UserManager } from "@/components/organization/UserManager";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import { RiArrowLeftLine, RiUserLine } from "@remixicon/react";

export default function UsersPage() {
  const t = useTranslations();
  const { data: userOrganization, isLoading: orgLoading } =
    useCurrentUserOrganization();

  if (orgLoading) {
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
        <div className="text-center py-8">
          <RiUserLine className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Organization Found
          </h2>
          <p className="text-gray-500 mb-4">
            You are not a member of any organization. Please contact your
            administrator.
          </p>
          <Link href="/settings">
            <Button variant="outline">
              <RiArrowLeftLine className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has permission to manage users
  const canManageUsers =
    userOrganization.role === "owner" || userOrganization.role === "admin";

  if (!canManageUsers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <RiArrowLeftLine className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
        </div>

        <div className="text-center py-8">
          <RiUserLine className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-500 mb-4">
            You don&apos;t have permission to manage users. Only organization owners
            and admins can access this page.
          </p>
          <p className="text-sm text-gray-400">
            Your current role:{" "}
            <span className="font-medium">{userOrganization.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserManager organizationId={userOrganization.organization_id} />
    </div>
  );
}
