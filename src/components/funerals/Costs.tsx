"use client";

import { useCosts } from "@/hooks";
import { CostForm, CostEditForm, CostDeleteForm } from "@/components/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Badge,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { RiMoneyDollarCircleLine, RiStoreLine } from "@remixicon/react";
import type { Database } from "@/types/database";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("title")}</h3>
          {!isEmpty && (
            <p className="text-sm text-gray-600 mt-1">
              {t("totalCost")}: €{totalCost.toFixed(2)}
            </p>
          )}
        </div>
        <CostForm funeralId={funeralId} />
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <RiMoneyDollarCircleLine className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="mt-4 text-lg font-medium text-gray-900">
              {t("empty.title")}
            </h4>
            <p className="mt-2 text-sm text-gray-500 text-center">
              {t("empty.description")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {costs.map((cost: FuneralSupplier) => (
            <Card key={cost.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {cost.product_name}
                      <Badge variant="outline" className="text-xs">
                        <RiStoreLine className="h-3 w-3 mr-1" />
                        {cost.supplier.name}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>
                        {format(
                          new Date(cost.created_at!),
                          "dd MMM yyyy 'om' HH:mm"
                        )}
                      </span>
                      <span className="font-medium text-green-600">
                        €{cost.total_price?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <CostEditForm cost={cost} />
                    <CostDeleteForm cost={cost} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t("quantity")}:</span>
                    <span className="ml-2 font-medium">{cost.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("unitPrice")}:</span>
                    <span className="ml-2 font-medium">
                      €{cost.unit_price.toFixed(2)}
                    </span>
                  </div>
                </div>
                {cost.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">{cost.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
