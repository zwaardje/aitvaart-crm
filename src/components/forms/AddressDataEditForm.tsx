"use client";

import * as React from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schemas } from "@/lib/validation";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { SubmitButton } from "./SubmitButton";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiEditLine } from "@remixicon/react";
import type { Database } from "@/types/database";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const addressDataSchema = schemas.deceased.update.pick({
  street: true,
  house_number: true,
  house_number_addition: true,
  postal_code: true,
  city: true,
});

type AddressDataFormValues = z.infer<typeof addressDataSchema>;

type DeceasedRow = Database["public"]["Tables"]["deceased"]["Row"];

interface AddressDataEditFormProps {
  deceased: DeceasedRow;
  onSaved?: () => void;
}

export function AddressDataEditForm({
  deceased,
  onSaved,
}: AddressDataEditFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: AddressDataFormValues) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("deceased")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", deceased.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["deceased"] });
      await queryClient.invalidateQueries({ queryKey: ["funerals"] });
      setIsOpen(false);
      onSaved?.();
    },
  });

  const defaultValues: AddressDataFormValues = {
    street: deceased.street ?? "",
    house_number: deceased.house_number ?? "",
    house_number_addition: deceased.house_number_addition ?? "",
    postal_code: deceased.postal_code ?? "",
    city: deceased.city ?? "",
  };

  const handleSubmit = async (values: AddressDataFormValues) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <RiEditLine className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adresgegevens bewerken</DialogTitle>
        </DialogHeader>
        <Form
          schema={addressDataSchema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        >
          <div className="space-y-4">
            <FormInput name="street" label="Straat" />
            <div className="grid grid-cols-2 gap-3">
              <FormInput name="house_number" label="Nummer" />
              <FormInput name="house_number_addition" label="Toevoeging" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormInput name="postal_code" label="Postcode" />
              <FormInput name="city" label="Woonplaats" />
            </div>
          </div>
          <DialogFooter className="mt-4 flex flex-row justify-between">
            <DialogClose asChild>
              <Button variant="outline">Annuleren</Button>
            </DialogClose>
            <SubmitButton isLoading={updateMutation.isPending}>
              Opslaan
            </SubmitButton>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
