"use client";

import * as React from "react";
import { z } from "zod";
import { schemas } from "@/lib/validation";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormSwitch } from "./FormSwitch";
import { SubmitButton } from "./SubmitButton";
import { Button, DialogClose, DialogFooter } from "@/components/ui";

export const funeralContactFormSchema = z.object({
  preferred_name: z.string().min(1, "Voornaam verplicht"),
  last_name: z.string().min(1, "Achternaam verplicht"),
  email: schemas.common.email.optional().or(z.literal("")),
  phone_number: schemas.common.phone,
  relation: z.string().optional().or(z.literal("")),
  is_primary: z.boolean().optional(),
});

export type FuneralContactFormValues = z.infer<typeof funeralContactFormSchema>;

interface FuneralContactFormProps {
  onSubmit: (data: FuneralContactFormValues) => void | Promise<void>;
  submitLabel?: string;
  defaultValues?: FuneralContactFormValues;
}

export function FuneralContactForm({
  defaultValues,
  onSubmit,
  submitLabel = "Opslaan",
}: FuneralContactFormProps) {
  return (
    <Form
      schema={funeralContactFormSchema}
      onSubmit={onSubmit}
      defaultValues={
        defaultValues ?? {
          preferred_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          relation: "",
          is_primary: false,
        }
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormInput name="preferred_name" label="Voornaam" />
        <FormInput name="last_name" label="Achternaam" />
        <FormInput
          name="email"
          type="email"
          label="E‑mail"
          placeholder="naam@voorbeeld.nl"
        />
        <FormInput
          name="phone_number"
          type="tel"
          label="Telefoon"
          placeholder="06 12345678"
        />
        <FormInput
          name="relation"
          label="Relatie tot overledene"
          placeholder="Partner, zoon, dochter..."
          className="md:col-span-2"
        />
        <FormSwitch
          name="is_primary"
          label="Primair contactpersoon"
          className="md:col-span-2"
        />
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
