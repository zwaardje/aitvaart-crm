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
import { Wishes } from "@/components/funerals/Wishes";

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
        <Wishes funeralId={id} />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw scenario item</DialogTitle>
          </DialogHeader>
          <ScenarioForm funeralId={id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
