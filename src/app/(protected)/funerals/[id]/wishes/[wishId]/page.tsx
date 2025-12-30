"use client";

import { useScenario } from "@/hooks/useScenarios";
import { useEffect, useState } from "react";
import { PageContent } from "@/components/layout/PageContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScenarioEditForm, ScenarioDeleteForm } from "@/components/forms";
import { Group } from "@/components/ui/Group";
import { SECTION_LABELS, ITEM_TYPE_LABELS } from "@/constants/scenario-labels";
import { Badge } from "@/components/ui/badge";
import { EntityDeleteButton } from "@/components/layout/EntityDeleteButton";
import { usePathname } from "next/navigation";
import { formatDate } from "@/lib/format-helpers";

export default function WishPage({
  params,
}: {
  params:
    | Promise<{ id: string; wishId: string }>
    | { id: string; wishId: string };
}) {
  const [funeralId, setFuneralId] = useState<string>("");
  const [wishId, setWishId] = useState<string>("");
  const pathname = usePathname();

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
      <div className="flex justify-between gap-2">
        <div className="flex flex-col gap-2">
          {scenario.created_at && (
            <Badge size="sm" className="font-normal max-w-fit">
              Aangemaakt op {formatDate(scenario.created_at)}
            </Badge>
          )}
          <h1 className="text-2xl font-medium">{scenario.title}</h1>
        </div>
        <div className="flex items-end justify-center">
          <EntityDeleteButton pathname={pathname} />
        </div>
      </div>

      {/* Wensinformatie Card */}
      <Card className="rounded-sm">
        <CardHeader className="pb-3 pl-3 pr-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Beschrijving
            </CardTitle>
            <div className="flex items-center gap-2">
              <ScenarioEditForm scenario={scenario} withDialog={true} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pl-3 pr-3 pb-3">
          {scenario.description && (
            <div className="col-span-2">
              <div className="text-muted-foreground text-xs mb-1"></div>
              <div className="text-sm">{scenario.description}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContent>
  );
}
