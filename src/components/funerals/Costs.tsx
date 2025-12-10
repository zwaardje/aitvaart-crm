"use client";

import { useCosts } from "@/hooks";
import { CostEditForm, CostDeleteForm } from "@/components/forms";
import { Skeleton, EmptyState } from "@/components/ui";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { RiMoneyDollarCircleLine, RiStoreLine } from "@remixicon/react";
import type { Database } from "@/types/database";
import { GenericCard } from "@/components/ui/GenericCard";

type FuneralSupplier =
  Database["public"]["Tables"]["funeral_suppliers"]["Row"] & {
    supplier: Database["public"]["Tables"]["suppliers"]["Row"];
  };

interface CostsProps {
  funeralId: string;
}

export function Costs({ funeralId }: CostsProps) {
  const { costs, isLoading } = useCosts(funeralId);
  const t = useTranslations("costs");

  const isEmpty = !costs || costs.length === 0;

  // Calculate total cost
  const totalCost = costs.reduce(
    (sum, cost) => sum + (cost.total_price || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("title")}</h3>
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
      <div className="flex items-center justify-end">
        {!isEmpty && (
          <p className="text-sm text-gray-600 mt-1">
            Totaal kosten: €{totalCost.toFixed(2)}
          </p>
        )}
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<RiMoneyDollarCircleLine className="h-6 w-6 text-gray-400" />}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      ) : (
        <div className="space-y-3">
          {costs.map((cost: FuneralSupplier) => (
            <GenericCard
              key={cost.id}
              title={cost.product_name}
              subtitle={`Aantal: ${
                cost.quantity
              } - Stukprijs: €${cost.unit_price.toFixed(2)}`}
              actions={
                <div className="flex items-center gap-1">
                  <CostEditForm cost={cost} />
                  <CostDeleteForm cost={cost} />
                </div>
              }
              content={
                <>
                  {cost.notes && (
                    <p className="text-sm text-gray-600">{cost.notes}</p>
                  )}
                </>
              }
              footer={
                <>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    {format(
                      new Date(cost.created_at!),
                      "dd MMM yyyy 'om' HH:mm"
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    `{} • € {`${cost.total_price?.toFixed(2)} incl. btw`}
                  </div>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
