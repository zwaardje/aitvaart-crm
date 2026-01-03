"use client";

import { Costs } from "@/components/funerals/Costs";
import { useEffect, useState, useCallback } from "react";
import { RiStoreLine, RiMoneyEuroBoxLine } from "@remixicon/react";
import { SupplierForm } from "@/components/forms/SupplierForm";

import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";

import { CostFormWizard } from "@/components/forms/CostFormWizard";
import { PricelistItemWizard } from "@/components/forms/PricelistItemWizard";
import { usePricelist } from "@/hooks/usePricelist";

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
  const [isPricelistItemWizardOpen, setIsPricelistItemWizardOpen] =
    useState(false);
  const { refetch: refetchPricelist } = usePricelist();
  const [refetchCosts, setRefetchCosts] = useState<(() => void) | null>(null);

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
        id: "costs",
        label: "Kosten toevoegen",
        icon: <RiMoneyEuroBoxLine className="h-3 w-3" />,
        onClick: () => {
          setIsDialogOpen("costs");
        },
      },
      {
        id: "supplier",
        label: "Leveranciers toevoegen",
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
      <div className="space-y-4 w-full">
        <SmartSearchBar
          onResultsChange={() => {}}
          placeholder="Zoek in kosten..."
          actions={searchActions()}
          searchContext={{
            entityTypes: ["funeral", "note", "contact"],
            filters: {
              funeralId: id,
            },
          }}
          sticky
        />
        <Costs
          funeralId={id}
          onRefetchReady={(refetch) => setRefetchCosts(() => refetch)}
        />
      </div>
      <CostFormWizard
        funeralId={id}
        open={isDialogOpen === "costs"}
        onOpenChange={(open) => setIsDialogOpen(open ? "costs" : undefined)}
        onSuccess={() => {
          setIsDialogOpen(undefined);
          // Refetch costs to show newly added items
          if (refetchCosts) {
            refetchCosts();
          }
        }}
        onRequestAddItem={() => setIsPricelistItemWizardOpen(true)}
      />

      <PricelistItemWizard
        open={isPricelistItemWizardOpen}
        onOpenChange={setIsPricelistItemWizardOpen}
        onSuccess={() => {
          refetchPricelist();
        }}
      />

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
