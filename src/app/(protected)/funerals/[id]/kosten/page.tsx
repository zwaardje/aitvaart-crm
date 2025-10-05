"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { Costs } from "@/components/funerals/Costs";
import { Skeleton } from "@/components/ui";
import { useEffect, useState, useCallback } from "react";
import { RiStoreLine, RiMoneyEuroBoxLine } from "@remixicon/react";
import { SupplierForm } from "@/components/forms/SupplierForm";

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
  const [isDialogOpen, setIsDialogOpen] = useState<
    "costs" | "supplier" | undefined
  >(undefined);

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

  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "costs",
        label: "Kosten toevoegen",
        icon: <RiMoneyEuroBoxLine className="h-3 w-3" />,
        onClick: () => {
          setIsDialogOpen("costs");
        },
      },
      {
        id: "supplier",
        label: "Leveranciers toevoege",
        icon: <RiStoreLine className="h-3 w-3" />,
        onClick: () => {
          setIsDialogOpen("supplier");
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
            onResultsChange={() => {}}
            placeholder="Zoek in kosten..."
            actions={searchActions()}
            entityTypes={["funeral", "note", "contact"]}
          />
          <Costs funeralId={id} />
        </div>
      )}
      <Dialog
        open={isDialogOpen === "costs"}
        onOpenChange={() => setIsDialogOpen(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voeg kosten toe</DialogTitle>
          </DialogHeader>
          <CostForm funeralId={id} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDialogOpen === "supplier"}
        onOpenChange={() => setIsDialogOpen(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voeg leverancier toe</DialogTitle>
          </DialogHeader>
          <SupplierForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
