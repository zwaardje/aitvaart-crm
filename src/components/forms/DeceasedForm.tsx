"use client";

import * as React from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schemas } from "@/lib/validation";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { SubmitButton } from "./SubmitButton";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import type { Database } from "@/types/database";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export const deceasedFormSchema = schemas.deceased.update;
export type DeceasedFormValues = z.infer<typeof deceasedFormSchema>;

type DeceasedRow = Database["public"]["Tables"]["deceased"]["Row"];

interface DeceasedFormProps {
  deceased: DeceasedRow;
  submitLabel?: string;
  onSaved?: () => void;
}

export function DeceasedForm({
  deceased,
  submitLabel = "Opslaan",
  onSaved,
}: DeceasedFormProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: DeceasedFormValues) => {
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
      onSaved?.();
    },
  });

  const defaultValues: DeceasedFormValues = {
    first_names: deceased.first_names ?? "",
    preferred_name: deceased.preferred_name ?? "",
    last_name: deceased.last_name ?? "",
    gender:
      (deceased.gender as "male" | "female" | "other" | undefined) ?? undefined,
    date_of_birth: deceased.date_of_birth ?? "",
    place_of_birth: deceased.place_of_birth ?? "",
    social_security_number: deceased.social_security_number ?? "",
    date_of_death: deceased.date_of_death ?? "",
    street: deceased.street ?? "",
    house_number: deceased.house_number ?? "",
    house_number_addition: deceased.house_number_addition ?? "",
    postal_code: deceased.postal_code ?? "",
    city: deceased.city ?? "",
    coffin_registration_number: deceased.coffin_registration_number ?? "",
  };

  return (
    <Form
      schema={deceasedFormSchema}
      onSubmit={(vals) => updateMutation.mutateAsync(vals)}
      defaultValues={defaultValues}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput name="first_names" label="Voornamen" />
        <FormInput name="preferred_name" label="Roepnaam" />
        <FormInput name="last_name" label="Achternaam" />
        <FormSelect
          name="gender"
          label="Geslacht"
          options={[
            { value: "male", label: "Man" },
            { value: "female", label: "Vrouw" },
            { value: "other", label: "Anders" },
          ]}
          placeholder="Kies geslacht"
        />
        <FormInput name="date_of_birth" label="Geboortedatum" type="date" />
        <FormInput name="place_of_birth" label="Geboorteplaats" />
        <FormInput name="date_of_death" label="Overlijdensdatum" type="date" />
        <FormInput
          name="coffin_registration_number"
          label="Kistregistratienummer"
        />

        <FormInput name="street" label="Straat" />
        <FormInput name="house_number" label="Huisnummer" />
        <FormInput name="house_number_addition" label="Toevoeging" />
        <FormInput name="postal_code" label="Postcode" />
        <FormInput name="city" label="Plaats" />
      </div>
      <DialogFooter className="mt-2">
        <DialogClose asChild>
          <Button variant="outline">Annuleren</Button>
        </DialogClose>
        <SubmitButton>{submitLabel}</SubmitButton>
      </DialogFooter>
    </Form>
  );
}
