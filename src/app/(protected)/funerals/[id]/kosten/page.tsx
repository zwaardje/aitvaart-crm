"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { Costs } from "@/components/funerals/Costs";
import { Skeleton } from "@/components/ui";
import { useEffect, useState, useCallback } from "react";
import { RiAddLine } from "@remixicon/react";

import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";

import { CostForm } from "@/components/forms/CostForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FuneralCostsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [id, setId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);
  const { funeral, isLoading } = useFuneral(id);

  const handleAddContactDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "settings",
        label: "Nabestaanden",
        icon: <RiAddLine className="h-4 w-4" />,
        onClick: () => {
          handleAddContactDialog();
        },
      },
    ],
    []
  );

  return (
    <>
      {isLoading && (
        <div className="pace-y-4 w-full">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && funeral && (
        <div className="space-y-4 w-full">
          <SmartSearchBar
            placeholder="Zoek in dashboard..."
            actions={searchActions()}
            entityTypes={["funeral", "note", "contact"]}
          />
          <Costs funeralId={id} />
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw contact</DialogTitle>
          </DialogHeader>
          <CostForm funeralId={id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
