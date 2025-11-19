"use client";

import * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { schemas } from "@/lib/validation";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormSwitch } from "./FormSwitch";
import { SubmitButton } from "./SubmitButton";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import { FormGroup } from "@/components/forms/FormGroup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiAddLine } from "@remixicon/react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useFuneralContacts } from "@/hooks";

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
  withDialog?: boolean;
  funeralId?: string;
  defaultValues?: FuneralContactFormValues;
  onSubmit?: (data: FuneralContactFormValues) => void | Promise<void>;
  submitLabel?: string;
}

export function FuneralContactForm({
  withDialog = false,
  funeralId,
  defaultValues,
  onSubmit: onSubmitProp,
  submitLabel = "Toevoegen",
}: FuneralContactFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { createContact } = useFuneralContacts(funeralId!);

  const onCreate = async (data: z.infer<typeof funeralContactFormSchema>) => {
    const supabase = getSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Geen gebruiker aangemeld");

    if (data.is_primary) {
      await supabase
        .from("funeral_contacts")
        .update({ is_primary: false })
        .eq("funeral_id", funeralId);
    }

    const { data: client, error: cErr } = await supabase
      .from("clients")
      .insert({
        entrepreneur_id: user.id,
        preferred_name: data.preferred_name,
        last_name: data.last_name,
        email: data.email || null,
        phone_number: data.phone_number || null,
      })
      .select("id")
      .single();
    if (cErr) throw cErr;

    await createContact({
      funeral_id: funeralId,
      client_id: client.id,
      relation: data.relation || null,
      is_primary: !!data.is_primary,
      notes: null,
    });
  };

  const handleSubmit = async (data: FuneralContactFormValues) => {
    try {
      if (onSubmitProp) {
        await onSubmitProp(data);
      } else {
        await onCreate(data);
      }
      if (withDialog) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      throw error;
    }
  };

  const formContent = (
    <Form
      schema={funeralContactFormSchema}
      onSubmit={handleSubmit}
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
        <FormGroup title="Persoonsgegevens">
          <div className="flex gap-3">
            <FormInput
              className="w-full flex-1"
              name="preferred_name"
              label="Voornaam"
            />
            <FormInput
              className="w-full flex-1"
              name="last_name"
              label="Achternaam"
            />
          </div>
        </FormGroup>
        <FormGroup title="Contactgegevens">
          <div className="flex gap-3">
            <FormInput
              className="w-full flex-1"
              name="email"
              type="email"
              label="E‑mail"
              placeholder="naam@voorbeeld.nl"
            />
            <FormInput
              className="w-full flex-1"
              name="phone_number"
              type="tel"
              label="Telefoon"
              placeholder="06 12345678"
            />
          </div>
        </FormGroup>
        <FormGroup title="Relatie tot overledene">
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
        </FormGroup>
      </div>
      <DialogFooter className="mt-2 flex flex-row justify-between">
        <DialogClose asChild>
          <Button variant="outline">Annuleren</Button>
        </DialogClose>
        <SubmitButton>{submitLabel}</SubmitButton>
      </DialogFooter>
    </Form>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            aria-label="Toevoegen"
            title="Toevoegen"
            size="sm"
          >
            <RiAddLine className="h-3 w-3" />
            Toevoegen
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nieuw contact</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
