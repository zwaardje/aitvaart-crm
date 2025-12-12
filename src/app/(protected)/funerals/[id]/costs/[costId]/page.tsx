"use client";

import { useCost } from "@/hooks/useCosts";
import { useEffect, useState } from "react";
import { PageContent } from "@/components/layout/PageContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CostEditForm, CostDeleteForm } from "@/components/forms";
import { Group } from "@/components/ui/Group";
import { format } from "date-fns";

export default function CostPage({
  params,
}: {
  params:
    | Promise<{ id: string; costId: string }>
    | { id: string; costId: string };
}) {
  const [funeralId, setFuneralId] = useState<string>("");
  const [costId, setCostId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id, costId: resolvedCostId }) => {
        setFuneralId(id);
        setCostId(resolvedCostId);
      });
    } else {
      setFuneralId(params.id);
      setCostId(params.costId);
    }
  }, [params]);

  const { cost, isLoading } = useCost(costId);

  if (isLoading) {
    return null;
  }

  if (!cost) {
    return null;
  }

  return (
    <PageContent className="flex flex-col gap-4 mt-4">
      {/* Kosteninformatie Card */}
      <Card className="rounded-sm">
        <CardHeader className="pb-3 pl-3 pr-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Kosteninformatie
            </CardTitle>
            <div className="flex items-center gap-2">
              <CostEditForm cost={cost} />
              <CostDeleteForm cost={cost} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pl-3 pr-3 pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Group>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Productnaam
                </div>
                <div className="text-sm">{cost.product_name || "-"}</div>
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Leverancier
                </div>
                <div className="text-sm">{cost.supplier?.name || "-"}</div>
              </div>
            </Group>

            <Group>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">Aantal</div>
                <div className="text-sm">{cost.quantity || "-"}</div>
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Stukprijs
                </div>
                <div className="text-sm">
                  €{cost.unit_price ? cost.unit_price.toFixed(2) : "-"}
                </div>
              </div>
            </Group>

            <Group>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Totaalprijs
                </div>
                <div className="text-sm font-medium">
                  €{cost.total_price ? cost.total_price.toFixed(2) : "-"} incl.
                  btw
                </div>
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Aangemaakt op
                </div>
                <div className="text-sm">
                  {cost.created_at
                    ? format(
                        new Date(cost.created_at),
                        "dd MMM yyyy 'om' HH:mm"
                      )
                    : "-"}
                </div>
              </div>
            </Group>

            {cost.notes && (
              <div className="col-span-2">
                <div className="text-muted-foreground text-xs mb-1">
                  Notities
                </div>
                <div className="text-sm">{cost.notes}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
