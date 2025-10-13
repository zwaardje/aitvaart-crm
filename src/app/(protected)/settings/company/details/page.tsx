"use client";

import React from "react";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { GenericCard } from "@/components/ui/GenericCard";
import { RiEditLine } from "@remixicon/react";
import { Button } from "@/components/ui/Button";

export default function CompanySettingsPage() {
  const { id } = useParams();
  const { data } = useCurrentUserOrganization();
  const { profile } = useAuth();

  const organization = data?.organization;

  if (!organization) {
    return <div>Organization not found</div>;
  }

  const formatAddress = () => {
    const parts = [
      organization.address,
      organization.postal_code && organization.city
        ? `${organization.postal_code} ${organization.city}`
        : organization.city || organization.postal_code,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Niet opgegeven";
  };

  // Format full name
  const formatFullName = () => {
    if (profile?.full_name) {
      const nameParts = profile.full_name.split(" ");
      return {
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
      };
    }
    return { firstName: "", lastName: "" };
  };

  const { firstName, lastName } = formatFullName();

  const bedrijfsgegevensContent = (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div>
            <div className="text-gray-500 text-xs mb-1">Bedrijfsnaam</div>
            <div className="text-sm font-medium">
              {organization.name || "Niet opgegeven"}
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">Adres</div>
            <div className="text-sm">{formatAddress()}</div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">E-mail</div>
            <div className="text-sm">
              {organization.email || "Niet opgegeven"}
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">Telefoonnummer</div>
            <div className="text-sm">
              {organization.phone_number || "Niet opgegeven"}
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">KVK nummer</div>
            <div className="text-sm">
              {data?.kvk_number || "Niet opgegeven"}
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">BTW nummer</div>
            <div className="text-sm">
              {data?.btw_number || "Niet opgegeven"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const bedrijfseigenaarContent = (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-500 text-xs mb-1">Voornaam</div>
              <div className="text-sm">{firstName || "Niet opgegeven"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Achternaam</div>
              <div className="text-sm">{lastName || "Niet opgegeven"}</div>
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">E-mail</div>
            <div className="text-sm">{profile?.email || "Niet opgegeven"}</div>
          </div>

          <div>
            <div className="text-gray-500 text-xs mb-1">Telefoonnummer</div>
            <div className="text-sm">{profile?.phone || "Niet opgegeven"}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <GenericCard
        title="Bedrijfsgegevens"
        content={bedrijfsgegevensContent}
        actions={
          <Button variant="outline" size="sm">
            <RiEditLine className="h-4 w-4" />
          </Button>
        }
      />

      <GenericCard
        title="Gegevens eigenaar"
        content={bedrijfseigenaarContent}
        actions={
          <Button variant="outline" size="sm">
            <RiEditLine className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}
