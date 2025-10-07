"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { useCallback, useEffect, useState } from "react";
import { RiBookLine } from "@remixicon/react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";

export default function FuneralNotesPage({
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

  return (
    <>
      {!isLoading && funeral && (
        <div className="space-y-4 w-full">
          <SmartSearchBar sticky />
        </div>
      )}
    </>
  );
}
