"use client";

import * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/forms/Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { SubmitButton } from "./SubmitButton";
import { usePricelist } from "@/hooks/usePricelist";
import { RiEditLine, RiAddLine } from "@remixicon/react";

const schema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  default_quantity: z.coerce.number().int().min(1).default(1),
  price_incl: z.coerce.number().min(0),
  vat_rate: z.coerce.number().optional().nullable(),
  unit: z.string().optional().nullable(),
});

type PricelistItemFormProps = {
  mode?: "create" | "edit";
  item?: any;
  onSuccess?: () => void;
  triggerVariant?: "button" | "icon";
};

export function PricelistItemForm({
  mode = "create",
  item,
  onSuccess,
  triggerVariant = "button",
}: PricelistItemFormProps) {
  const [open, setOpen] = useState(false);
  const { createItem, updateItem, isCreating, isUpdating } = usePricelist();

  function handleSubmit(values: z.infer<typeof schema>) {
    if (mode === "create") {
      createItem(values as any, {
        onSuccess: () => {
          setOpen(false);
          onSuccess?.();
        },
      });
      return;
    }
    if (item?.id) {
      updateItem(
        { id: item.id, updates: values as any },
        {
          onSuccess: () => {
            setOpen(false);
            onSuccess?.();
          },
        }
      );
    }
  }

  const trigger =
    triggerVariant === "icon" ? (
      <Button variant="outline" size="sm">
        {mode === "create" ? (
          <RiAddLine className="h-4 w-4" />
        ) : (
          <RiEditLine className="h-4 w-4" />
        )}
      </Button>
    ) : (
      <Button variant="default" size="sm">
        {mode === "create" ? "+ Toevoegen" : "Bewerken"}
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Nieuw prijslijstitem"
              : "Prijslijstitem bewerken"}
          </DialogTitle>
        </DialogHeader>
        <Form
          schema={schema}
          onSubmit={handleSubmit}
          defaultValues={{
            title: item?.title || "",
            subtitle: item?.subtitle || "",
            description: item?.description || "",
            default_quantity: item?.default_quantity ?? 1,
            price_incl: item?.price_incl ?? 0,
            vat_rate: item?.vat_rate ?? 21,
            unit: item?.unit || "",
          }}
        >
          <div className="space-y-4">
            <FormInput name="title" label="Titel" required />
            <FormInput name="subtitle" label="Subtitel" />
            <FormTextarea name="description" label="Omschrijving" rows={4} />
            <div className="grid grid-cols-3 gap-4">
              <FormInput name="default_quantity" label="Aantal" type="number" />
              <FormInput
                name="price_incl"
                label="Prijs incl. btw"
                type="number"
              />
              <FormInput name="vat_rate" label="btw%" type="number" />
            </div>
            <FormInput
              name="unit"
              label="Eenheid"
              placeholder="stuk, uur, etc."
            />
            <DialogFooter className="mt-2 flex flex-row justify-between">
              <DialogClose asChild>
                <Button variant="outline">Annuleren</Button>
              </DialogClose>
              <SubmitButton isLoading={isCreating || isUpdating}>
                Opslaan
              </SubmitButton>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
