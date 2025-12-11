"use client";

import { useScenario } from "@/hooks/useScenarios";
import { useEffect, useState } from "react";
import { PageContent } from "@/components/layout/PageContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScenarioEditForm, ScenarioDeleteForm } from "@/components/forms";
import { Group } from "@/components/ui/Group";
import { SECTION_LABELS, ITEM_TYPE_LABELS } from "@/constants/scenario-labels";

export default function WishPage({
  params,
}: {
  params:
    | Promise<{ id: string; wishId: string }>
    | { id: string; wishId: string };
}) {
  const [funeralId, setFuneralId] = useState<string>("");
  const [wishId, setWishId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id, wishId: resolvedWishId }) => {
        setFuneralId(id);
        setWishId(resolvedWishId);
      });
    } else {
      setFuneralId(params.id);
      setWishId(params.wishId);
    }
  }, [params]);

  const { scenario, isLoading } = useScenario(wishId);

  if (isLoading) {
    return null;
  }

  if (!scenario) {
    return null;
  }

  return (
    <PageContent className="flex flex-col gap-4 mt-4">
      {/* Wensinformatie Card */}
      <Card className="rounded-sm">
        <CardHeader className="pb-3 pl-3 pr-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Wensinformatie</CardTitle>
            <div className="flex items-center gap-2">
              <ScenarioEditForm scenario={scenario} withDialog={true} />
              <ScenarioDeleteForm scenario={scenario} withDialog={true} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pl-3 pr-3 pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Group>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Titel
                </div>
                <div className="text-sm">{scenario.title || "-"}</div>
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Sectie
                </div>
                <div className="text-sm">
                  {SECTION_LABELS[scenario.section] || scenario.section || "-"}
                </div>
              </div>
            </Group>

            <Group>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Type
                </div>
                <div className="text-sm">
                  {ITEM_TYPE_LABELS[scenario.item_type] || scenario.item_type || "-"}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Actief
                </div>
                <div className="text-sm">{scenario.is_active ? "Ja" : "Nee"}</div>
              </div>
            </Group>

            {scenario.description && (
              <div className="col-span-2">
                <div className="text-muted-foreground text-xs mb-1">
                  Beschrijving
                </div>
                <div className="text-sm">{scenario.description}</div>
              </div>
            )}

            {scenario.extra_field_label && scenario.extra_field_value && (
              <div className="col-span-2">
                <div className="text-muted-foreground text-xs mb-1">
                  {scenario.extra_field_label}
                </div>
                <div className="text-sm">{scenario.extra_field_value}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}

