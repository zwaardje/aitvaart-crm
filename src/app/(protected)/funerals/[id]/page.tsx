"use client";

import { Content } from "@/components/layout";
import { useFuneral } from "@/hooks/useFunerals";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui";
import { FuneralContacts } from "@/components/funerals/FuneralContacts";
import { DeceasedCard } from "@/components/funerals/DeceasedCard";
import { TaskList } from "@/components/tasks";
import { useEffect, useState } from "react";

export default function FuneralDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const t = useTranslations("funerals");
  const [id, setId] = useState<string>("");

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

  return (
    <Content>
      {isLoading && (
        <div className="space-y-4 w-full">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && funeral && (
        <div className="space-y-4 w-full">
          <TaskList funeralId={funeral.id} />
          <DeceasedCard deceased={funeral.deceased as any} />

          <FuneralContacts funeralId={id} />
        </div>
      )}
    </Content>
  );
}
