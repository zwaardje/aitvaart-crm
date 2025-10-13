"use client";

import React from "react";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { GenericCard } from "@/components/ui/GenericCard";

export default function PricingSettingsPage() {
  const { id } = useParams();
  const { data } = useCurrentUserOrganization();
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <GenericCard title="Prijslijst Instellingen"></GenericCard>
      <GenericCard title="Prijscategorieën"></GenericCard>
    </div>
  );
}
