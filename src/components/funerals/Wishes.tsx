"use client";

import { useScenarios } from "@/hooks/useScenarios";
import { Skeleton, EmptyState } from "@/components/ui";
import { RiHeartLine } from "@remixicon/react";
import type { Database } from "@/types/database";
import { useState, useMemo } from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { ScenarioEditForm, ScenarioDeleteForm } from "@/components/forms";
import { SECTION_LABELS, ITEM_TYPE_LABELS } from "@/constants/scenario-labels";
import type { SearchResult } from "@/hooks/useSearch";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

interface WishesProps {
  funeralId: string;
}

export function Wishes({ funeralId }: WishesProps) {
  const { data: scenarios, isLoading } = useScenarios(funeralId);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Show search results if available, otherwise show all scenarios
  // Note: scenario search is not yet implemented in the database search function
  const displayScenarios = useMemo(() => {
    if (searchResults.length > 0) {
      // Filter for scenario results (when search supports it)
      const scenarioResults = searchResults
        .filter((result) => (result.entity_type as string) === "scenario")
        .map((result) =>
          scenarios?.find((scenario) => scenario.id === result.entity_id)
        )
        .filter(Boolean) as FuneralScenario[];

      return scenarioResults.length > 0 ? scenarioResults : scenarios || [];
    }
    return scenarios || [];
  }, [searchResults, scenarios]);

  const isEmpty = !displayScenarios || displayScenarios.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Wensen</h3>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      {isEmpty ? (
        <EmptyState
          icon={<RiHeartLine className="h-6 w-6 text-gray-400" />}
          title="Nog geen wensen"
          description="Voeg wensen toe voor deze uitvaart"
        />
      ) : (
        <div className="space-y-3">
          {displayScenarios.map((scenario: FuneralScenario) => (
            <GenericCard
              key={scenario.id}
              to={`/funerals/${funeralId}/wishes/${scenario.id}`}
              title={scenario.title}
              subtitle={`${
                SECTION_LABELS[scenario.section] || scenario.section
              } - ${
                ITEM_TYPE_LABELS[scenario.item_type] || scenario.item_type
              }`}
              actions={
                <div className="flex items-center gap-1">
                  <ScenarioEditForm scenario={scenario} withDialog={true} />
                  <ScenarioDeleteForm scenario={scenario} withDialog={true} />
                </div>
              }
              content={
                <div className="space-y-2">
                  {scenario.description && (
                    <p className="text-sm text-gray-600">
                      {scenario.description}
                    </p>
                  )}
                  {scenario.extra_field_label && scenario.extra_field_value && (
                    <div className="text-sm">
                      <span className="text-gray-500">
                        {scenario.extra_field_label}:
                      </span>
                      <span className="ml-1 text-gray-900">
                        {scenario.extra_field_value}
                      </span>
                    </div>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
