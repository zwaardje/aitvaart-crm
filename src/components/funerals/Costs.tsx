"use client";

import { useCosts } from "@/hooks";
import { CostDeleteForm } from "@/components/forms";
import { EmptyState } from "@/components/ui";
import { useTranslations } from "next-intl";
import type { Database } from "@/types/database";
import { GenericCard } from "@/components/ui/GenericCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { calculatePriceIncl } from "@/lib/price-utils";
import { useMemo, useEffect } from "react";

type FuneralSupplier =
  Database["public"]["Tables"]["funeral_suppliers"]["Row"] & {
    supplier: Database["public"]["Tables"]["suppliers"]["Row"];
  };

interface CostsProps {
  funeralId: string;
  onRefetchReady?: (refetch: () => void) => void;
}

// Default VAT rate (21% is standard in Netherlands)
const DEFAULT_VAT_RATE = 21;

export function Costs({ funeralId, onRefetchReady }: CostsProps) {
  const { costs, isLoading, updateCost, refetch } = useCosts(funeralId);
  const t = useTranslations("costs");

  // Expose refetch function to parent
  useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  const isEmpty = !costs || costs.length === 0;

  // Calculate total cost including VAT
  const totalCostInclVat = useMemo(() => {
    return costs.reduce((sum, cost) => {
      const totalExclVat = cost.total_price || 0;
      const totalInclVat = calculatePriceIncl(totalExclVat, DEFAULT_VAT_RATE);
      return sum + totalInclVat;
    }, 0);
  }, [costs]);

  const handleQuantityChange = async (costId: string, newQuantity: number) => {
    const cost = costs.find((c) => c.id === costId);
    if (!cost || newQuantity < 0.01) return;

    try {
      await updateCost(costId, {
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  return (
    <div className="relative pb-24">
      {isEmpty ? (
        <div className="px-4">
          <EmptyState
            title={t("empty.title")}
            description={t("empty.description")}
          />
        </div>
      ) : (
        <div className="space-y-3 px-4">
          {costs.map((cost: FuneralSupplier) => {
            const totalExclVat = cost.total_price || 0;
            const totalInclVat = calculatePriceIncl(
              totalExclVat,
              DEFAULT_VAT_RATE
            );

            return (
              <GenericCard
                key={cost.id}
                title={cost.product_name}
                subtitle={cost.supplier?.name}
                content={cost.notes}
                actions={<CostDeleteForm cost={cost} />}
                footer={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-gray-500">Aantal</span>
                      <div className="flex items-center gap-1 border rounded">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(
                              cost.id,
                              Math.max(0.01, (cost.quantity || 1) - 1)
                            )
                          }
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={cost.quantity || 1}
                          onChange={(e) =>
                            handleQuantityChange(
                              cost.id,
                              parseFloat(e.target.value) || 0.01
                            )
                          }
                          className="w-16 h-8 text-center border-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(
                              cost.id,
                              (cost.quantity || 1) + 1
                            )
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">
                        Totaal incl. {DEFAULT_VAT_RATE}% btw
                      </span>
                      <span className="font-semibold text-base">
                        €{totalInclVat.toFixed(2)}
                      </span>
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>
      )}

      {/* Fixed total at bottom */}
      {!isEmpty && (
        <div className="fixed bottom-12 left-0 right-0 bg-gray-50 border-t border-gray-200 px-4 py-4 z-10 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Totaal incl. {DEFAULT_VAT_RATE}% btw
            </span>
            <span className="text-md font-bold">
              €{totalCostInclVat.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
