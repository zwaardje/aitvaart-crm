"use client";

import React from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { Button } from "@/components/ui/Button";
import { PricelistItemForm } from "@/components/forms/PricelistItemForm";
import { usePricelist } from "@/hooks/usePricelist";
import { RiPencilLine } from "@remixicon/react";

export default function PricingSettingsPage() {
  const { items, isLoading, refetch } = usePricelist();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex-1" />
        <PricelistItemForm mode="create" onSuccess={refetch} />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div>Laden…</div>
        ) : items.length === 0 ? (
          <GenericCard
            title="Nog geen items"
            actions={<PricelistItemForm mode="create" onSuccess={refetch} />}
          />
        ) : (
          items.map((item) => (
            <GenericCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle || undefined}
              content={
                item.description ? (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {item.description}
                  </div>
                ) : undefined
              }
              footer={
                <div className="flex items-center justify-between text-sm">
                  <div>Aantal</div>
                  <div className="font-medium">
                    € {Number(item.price_incl).toLocaleString("nl-NL")}
                  </div>
                </div>
              }
              actions={
                <div className="flex items-center gap-2">
                  <PricelistItemForm
                    mode="edit"
                    item={item}
                    onSuccess={refetch}
                    triggerVariant="icon"
                  />
                </div>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
