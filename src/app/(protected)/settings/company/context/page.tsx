"use client";

import React from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { RiSparklingLine } from "@remixicon/react";

export default function CompanySettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <GenericCard
        icon={<RiSparklingLine className="h-4 w-4" />}
        title="Bedrijfsomschrijving"
        to="/settings/company/context/business-description"
      />
      <GenericCard
        icon={<RiSparklingLine className="h-4 w-4" />}
        title="Wensen- en intakegesprekken"
        to="/settings/company/context/wish-intake"
      />
      <GenericCard
        icon={<RiSparklingLine className="h-4 w-4" />}
        title="Kostenbegrotingen"
        to="/settings/company/context/cost-estimates"
      />
    </div>
  );
}
