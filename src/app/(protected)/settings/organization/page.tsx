"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { GenericCard } from "@/components/ui/GenericCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  useCurrentUserOrganization,
  useUpdateOrganization,
} from "@/hooks/useOrganizations";
import {
  RiArrowLeftLine,
  RiBuildingLine,
  RiEditLine,
  RiSaveLine,
  RiCloseLine,
} from "@remixicon/react";

export default function OrganizationPage() {
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    phone_number: "",
    email: "",
    address: "",
    postal_code: "",
    city: "",
    country: "Netherlands",
  });

  const { data: userOrganization, isLoading: orgLoading } =
    useCurrentUserOrganization();
  const updateOrganization = useUpdateOrganization();

  // Check if user has permission to manage organization
  const canManageOrganization = userOrganization?.role === "owner";

  React.useEffect(() => {
    if (userOrganization?.organization) {
      setFormData({
        name: userOrganization.organization.name || "",
        description: userOrganization.organization.description || "",
        website: userOrganization.organization.website || "",
        phone_number: userOrganization.organization.phone_number || "",
        email: userOrganization.organization.email || "",
        address: userOrganization.organization.address || "",
        postal_code: userOrganization.organization.postal_code || "",
        city: userOrganization.organization.city || "",
        country: userOrganization.organization.country || "Netherlands",
      });
    }
  }, [userOrganization]);

  const handleSave = async () => {
    if (!userOrganization?.organization?.id) return;

    try {
      await updateOrganization.mutateAsync({
        id: userOrganization.organization.id,
        ...formData,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating organization:", error);
    }
  };

  const handleCancel = () => {
    if (userOrganization?.organization) {
      setFormData({
        name: userOrganization.organization.name || "",
        description: userOrganization.organization.description || "",
        website: userOrganization.organization.website || "",
        phone_number: userOrganization.organization.phone_number || "",
        email: userOrganization.organization.email || "",
        address: userOrganization.organization.address || "",
        postal_code: userOrganization.organization.postal_code || "",
        city: userOrganization.organization.city || "",
        country: userOrganization.organization.country || "Netherlands",
      });
    }
    setIsEditing(false);
  };

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
          footer={
            <Link href="/settings">
              <Button variant="outline">
                <RiArrowLeftLine className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!canManageOrganization) {
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

        <GenericCard
          title="Access Restricted"
          subtitle="You don't have permission to manage organization settings. Only organization owners can access this page."
          content={
            <div className="text-center py-4">
              <RiBuildingLine className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm text-gray-400">
                Your current role:{" "}
                <span className="font-medium">{userOrganization.role}</span>
              </p>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Organization Status */}
        <GenericCard
          title="Organization Status"
          subtitle="Plan details and account status"
          content={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Plan Type</Label>
                <div className="mt-1">
                  <Badge variant="secondary">
                    {userOrganization.organization?.plan_type || "Not set"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Max Users</Label>
                <p className="text-sm text-gray-900 mt-1">
                  {userOrganization.organization?.max_users || "Not set"}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
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
            </div>
          }
        />

        {/* Basic Information */}
        <GenericCard
          title="Basic Information"
          subtitle="Organization name, website, and description"
          content={
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Organization Name *</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter organization name"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {userOrganization.organization?.name || "Not set"}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {userOrganization.organization?.website || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter organization description"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1">
                    {userOrganization.organization?.description || "Not set"}
                  </p>
                )}
              </div>
            </div>
          }
          actions={
            !isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="ghost"
              >
                <RiEditLine className="h-4 w-4" />
              </Button>
            ) : undefined
          }
          footer={
            <span className="text-xs text-gray-500">* Required field</span>
          }
        />

        {/* Contact Information */}
        <GenericCard
          title="Contact Information"
          subtitle="Email and phone number for your organization"
          content={
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder="contact@example.com"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {userOrganization.organization?.email || "Not set"}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone_number: e.target.value,
                        }))
                      }
                      placeholder="+31 6 12345678"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {userOrganization.organization?.phone_number || "Not set"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          }
          actions={
            !isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="ghost"
              >
                <RiEditLine className="h-4 w-4" />
              </Button>
            ) : undefined
          }
        />

        {/* Address Information */}
        <GenericCard
          title="Address Information"
          subtitle="Physical address and location details"
          content={
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Street address"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1">
                    {userOrganization.organization?.address || "Not set"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  {isEditing ? (
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          postal_code: e.target.value,
                        }))
                      }
                      placeholder="1234 AB"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {userOrganization.organization?.postal_code || "Not set"}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="Amsterdam"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {userOrganization.organization?.city || "Not set"}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  {isEditing ? (
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      placeholder="Netherlands"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {userOrganization.organization?.country || "Not set"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          }
          actions={
            !isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="ghost"
              >
                <RiEditLine className="h-4 w-4" />
              </Button>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
