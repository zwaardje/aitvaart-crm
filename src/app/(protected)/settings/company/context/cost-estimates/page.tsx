"use client";

import React from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import { OrganizationNoteForm } from "@/components/forms/OrganizationNoteForm";

export default function CostEstimatesPage() {
  const { data, refetch } = useCurrentUserOrganization();
  const organization = data?.organization;

  if (!organization) return null;

  return (
    <div className="flex flex-col gap-4">
      <GenericCard
        title="Kostenbegrotingen"
        content={
          <div className="text-sm whitespace-pre-wrap">
            {organization.cost_estimate_notes ||
              "Nog geen informatie opgegeven"}
          </div>
        }
        actions={
          <OrganizationNoteForm
            organizationId={organization.id}
            column="cost_estimate_notes"
            title="Kostenbegrotingen"
            defaultValue={organization.cost_estimate_notes as any}
            onSuccess={refetch}
          />
        }
      />
    </div>
  );
}
