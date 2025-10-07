"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { Skeleton, Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { GenericCard } from "@/components/ui/GenericCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ScenarioForm,
  ScenarioEditForm,
  ScenarioDeleteForm,
} from "@/components/forms";
import { useScenarios } from "@/hooks/useScenarios";
import { Database } from "@/types/database";
import { RiAddLine, RiCalendarLine } from "@remixicon/react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { Content } from "@/components/layout";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

interface ScenarioContentProps {
  funeralId: string;
}

function ScenarioContent({ funeralId }: ScenarioContentProps) {
  const { data: scenarios, isLoading } = useScenarios(funeralId);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const sectionLabels: Record<string, string> = {
    soort_uitvaart: "Soort uitvaart",
    verzorging_en_opbaring: "Verzorging en opbaring",
    ceremonie: "Ceremonie",
    kosten: "Kosten",
  };

  const itemTypeLabels: Record<string, string> = {
    begrafenis: "Begrafenis",
    crematie: "Crematie",
    laatste_verzorging: "Laatste verzorging",
    thanatopraxie: "Thanatopraxie",
    opbaring: "Opbaring",
    ceremonie: "Ceremonie",
    muziek: "Muziek",
    bloemen: "Bloemen",
    transport: "Transport",
  };

  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "add-scenario",
        label: "Scenario item toevoegen",
        icon: <RiAddLine className="h-3 w-3" />,
        onClick: () => {
          setIsDialogOpen(true);
        },
      },
    ],
    []
  );

  return (
    <>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <SmartSearchBar
            placeholder="Zoek in scenario..."
            actions={searchActions()}
            entityTypes={["funeral", "note", "contact"]}
            sticky
          />

          {scenarios && scenarios.length > 0 && (
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <GenericCard
                  key={scenario.id}
                  title={scenario.title}
                  subtitle={` ${
                    sectionLabels[scenario.section] || scenario.section
                  } - ${
                    itemTypeLabels[scenario.item_type] || scenario.item_type
                  }`}
                  actions={
                    <div className="flex items-center gap-1">
                      <ScenarioEditForm scenario={scenario} withDialog={true} />
                      <ScenarioDeleteForm
                        scenario={scenario}
                        withDialog={true}
                      />
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      {scenario.description && (
                        <p className="text-sm text-gray-600">
                          {scenario.description}
                        </p>
                      )}
                      {scenario.extra_field_label &&
                        scenario.extra_field_value && (
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
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw scenario item</DialogTitle>
          </DialogHeader>
          <ScenarioForm funeralId={funeralId} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);
  return <ScenarioContent funeralId={id} />;
}
