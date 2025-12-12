"use client";

import { useFunerals, type FuneralFilters } from "@/hooks/useFunerals";
import { Skeleton, GenericCard } from "@/components/ui";
import { RiAddLine } from "@remixicon/react";
import { Button } from "@/components/ui/Button";
import { FuneralCard } from "./FuneralsCard";

export function Funerals({
  filters,
  handleCreateFuneral,
}: {
  filters: FuneralFilters;
  handleCreateFuneral: () => void;
}) {
  const { funerals, isLoading } = useFunerals(filters);
  const isEmpty = !funerals || funerals.length === 0;

  return (
    <section className="flex flex-col pb-4 gap-4 w-full">
      {isEmpty ? (
        <GenericCard
          className="bg-gray-100"
          title="Geen uitvaarten gevonden"
          content={
            <div className="flex flex-col gap-3 text-left">
              <p>Er zijn momenteel nog geen actieve uitvaarten gevonden.</p>
              <Button onClick={handleCreateFuneral}>
                <RiAddLine className="h-4 w-4" />
                Nieuwe uitvaart
              </Button>
            </div>
          }
        />
      ) : (
        <>
          {funerals!.map((f, i) => (
            <FuneralCard key={f.id} funeral={f} />
          ))}
        </>
      )}
    </section>
  );
}
