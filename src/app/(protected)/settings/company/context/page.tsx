"use client";

import React from "react";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { GenericCard } from "@/components/ui/GenericCard";
import { RiSparklingLine } from "@remixicon/react";

export default function CompanySettingsPage() {
  const { id } = useParams();
  const { data } = useCurrentUserOrganization();
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <GenericCard
        icon={<RiSparklingLine className="h-4 w-4" />}
        title="Werkwijze"
        to="/settings/company/context/work-method"
      >
        hoi
      </GenericCard>
      <GenericCard
        icon={<RiSparklingLine className="h-4 w-4" />}
        title="Schrijfstijl"
        to="/settings/company/context/writing-style"
      ></GenericCard>
    </div>
  );
}
