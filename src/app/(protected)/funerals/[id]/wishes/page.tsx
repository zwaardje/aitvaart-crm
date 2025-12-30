"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScenarioForm } from "@/components/forms";
import { RiAddLine } from "@remixicon/react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { useScenarios } from "@/hooks/useScenarios";
import { GenericCard } from "@/components/ui/GenericCard";
import type { Database } from "@/types/database";
import { truncateText } from "@/lib/display-helpers";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

export default function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [id, setId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);

  const { data: scenarios } = useScenarios(id);

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
      <div className="space-y-4 w-full">
        <SmartSearchBar
          placeholder="Zoek in wensen..."
          actions={searchActions()}
          onResultsChange={() => {}}
          searchContext={{
            entityTypes: ["scenario"],
            filters: {
              funeralId: id,
            },
          }}
          sticky
          aiContext={{
            page: "scenarios",
            funeralId: id,
            scope: "manage",
          }}
        />
        <div className="px-4">
          <div className="flex flex-col gap-2">
            {scenarios?.map((scenario: FuneralScenario) => (
              <GenericCard
                key={scenario.id}
                to={`/funerals/${id}/wishes/${scenario.id}`}
                title={scenario.title}
                subtitle={truncateText(scenario.description, 80)}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw scenario item</DialogTitle>
          </DialogHeader>
          <ScenarioForm
            funeralId={id}
            closeDialog={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
