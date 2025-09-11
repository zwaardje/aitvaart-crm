"use client";

import { Content } from "@/components/layout";
import { useFuneral } from "@/hooks/useFunerals";
import { Costs } from "@/components/funerals/Costs";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui";

export default function FuneralCostsPage({
  params,
}: {
  params: { id: string };
}) {
  const t = useTranslations("funerals");
  const { funeral, isLoading } = useFuneral(params.id);

  return (
    <Content>
      {isLoading && (
        <div className="pace-y-4 w-full">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && funeral && (
        <div className="space-y-4 w-full">
          <Costs funeralId={params.id} />
        </div>
      )}
    </Content>
  );
}
