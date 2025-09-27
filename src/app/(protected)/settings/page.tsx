"use client";

import React from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { Badge } from "@/components/ui/badge";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import {
  RiUserLine,
  RiShieldLine,
  RiSettingsLine,
  RiBuildingLine,
  RiNotificationLine,
  RiKeyLine,
  RiDatabaseLine,
  RiArrowRightLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { SectionHeader } from "@/components/layout";

export default function SettingsPage() {
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
        <GenericCard
          title="No Organization Found"
          subtitle="You are not a member of any organization. Please contact your administrator."
          content={
            <div className="text-center py-4">
              <RiBuildingLine className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            </div>
          }
        />
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Organization Management",
      description: "Manage your organization settings and team",
      icon: RiBuildingLine,
      items: [
        {
          title: "Organization Settings",
          description: "View and edit organization details",
          href: "/settings/organization",
          icon: RiSettingsLine,
          badge: null,
        },
        {
          title: "Team Members",
          description: "Manage users and their access",
          href: "/settings/users",
          icon: RiUserLine,
          badge:
            userOrganization.role === "owner" ||
            userOrganization.role === "admin"
              ? null
              : "Restricted",
        },
        {
          title: "Permissions & Roles",
          description: "Configure permissions and user roles",
          href: "/settings/permissions",
          icon: RiShieldLine,
          badge:
            userOrganization.role === "owner" ||
            userOrganization.role === "admin"
              ? null
              : "Restricted",
        },
      ],
    },
    {
      title: "Account Settings",
      description: "Personal account preferences",
      icon: RiUserLine,
      items: [
        {
          title: "Profile Settings",
          description: "Update your personal information",
          href: "/settings/profile",
          icon: RiUserLine,
          badge: null,
        },
        {
          title: "Notifications",
          description: "Configure notification preferences",
          href: "/settings/notifications",
          icon: RiNotificationLine,
          badge: "Coming Soon",
        },
        {
          title: "Security",
          description: "Password and security settings",
          href: "/settings/security",
          icon: RiKeyLine,
          badge: "Coming Soon",
        },
      ],
    },
    {
      title: "System Settings",
      description: "Advanced system configuration",
      icon: RiDatabaseLine,
      items: [
        {
          title: "Data Management",
          description: "Export and manage your data",
          href: "/settings/data",
          icon: RiDatabaseLine,
          badge: userOrganization.role === "owner" ? null : "Owner Only",
        },
        {
          title: "API Keys",
          description: "Manage API access and integrations",
          href: "/settings/api",
          icon: RiKeyLine,
          badge: userOrganization.role === "owner" ? null : "Owner Only",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <SectionHeader
              title={section.title}
              description={section.description}
              icon={<section.icon className="h-5 w-5" />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item, itemIndex) => {
                const isDisabled = item.badge && item.badge !== "Coming Soon";
                const IconComponent = item.icon;

                return (
                  <GenericCard
                    key={itemIndex}
                    icon={<IconComponent className="h-3 w-3" />}
                    title={item.title}
                    subtitle={item.description}
                    footer={
                      <Link
                        href={isDisabled ? "#" : item.href}
                        variant="outline"
                        size="sm"
                      >
                        Configureer
                      </Link>
                    }
                    className={`hover:shadow-md transition-shadow gap-y-4 ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Organization Info */}
      <GenericCard
        title="Current Organization"
        subtitle="Your organization details and role information"
        content={
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
                Your Role
              </label>
              <Badge
                className={
                  userOrganization.role === "owner"
                    ? "bg-red-100 text-red-800"
                    : userOrganization.role === "admin"
                    ? "bg-orange-100 text-orange-800"
                    : userOrganization.role === "editor"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {userOrganization.role}
              </Badge>
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
                Status
              </label>
              <Badge
                variant={
                  userOrganization.organization?.is_active
                    ? "default"
                    : "secondary"
                }
              >
                {userOrganization.organization?.is_active
                  ? "Active"
                  : "Inactive"}
              </Badge>
            </div>
          </div>
        }
        className="mt-8"
      />
    </div>
  );
}
