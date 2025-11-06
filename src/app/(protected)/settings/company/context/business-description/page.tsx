"use client";

import React from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import { OrganizationNoteForm } from "@/components/forms/OrganizationNoteForm";

export default function BusinessDescriptionPage() {
  const { data, refetch } = useCurrentUserOrganization();
  const organization = data?.organization;

  if (!organization) return null;

  return (
    <div className="flex flex-col gap-4">
      <GenericCard
        title="Bedrijfsomschrijving"
        content={
          <div className="text-sm whitespace-pre-wrap">
            {organization.description || "Nog geen omschrijving opgegeven"}
          </div>
        }
        actions={
          <OrganizationNoteForm
            organizationId={organization.id}
            column="description"
            title="Bedrijfsomschrijving"
            defaultValue={organization.description}
            onSuccess={refetch}
          />
        }
      />
    </div>
  );
}
