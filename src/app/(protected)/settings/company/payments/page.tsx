"use client";

import React from "react";
import { useCurrentUserOrganization } from "@/hooks/useOrganizations";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { GenericCard } from "@/components/ui/GenericCard";

export default function PaymentsSettingsPage() {
  const { id } = useParams();
  const { data } = useCurrentUserOrganization();
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <GenericCard title="Betaalmethoden"></GenericCard>
      <GenericCard title="Factuur Instellingen"></GenericCard>
      <GenericCard title="Betalingsvoorwaarden"></GenericCard>
    </div>
  );
}
