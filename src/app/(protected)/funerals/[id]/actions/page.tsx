"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { useCallback, useEffect, useState } from "react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { Actions } from "@/components/funerals/Actions";
import { Skeleton } from "@/components/ui";

export default function ActionsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 w-full">
        <SmartSearchBar
          placeholder="Zoek in acties..."
          onResultsChange={() => {}}
          searchContext={{
            entityTypes: [
              "task" as "note" | "cost" | "contact" | "funeral" | "scenario",
            ],
            filters: {
              funeralId: id,
            },
          }}
          sticky
          aiContext={{
            page: "general",
            funeralId: id,
            scope: "manage",
          }}
        />
        <Actions funeralId={id} />
      </div>
    </>
  );
}
