"use client";

import * as React from "react";
import { useState } from "react";
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
import { schemas } from "@/lib/validation";
import { useUpdateOrganization } from "@/hooks/useOrganizations";
import { RiEditLine } from "@remixicon/react";
import type { Database } from "@/types/database";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

interface OrganizationEditFormProps {
  organization: Organization;
  onSuccess?: () => void;
}

export function OrganizationEditForm({
  organization,
  onSuccess,
}: OrganizationEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateOrganization, isPending } = useUpdateOrganization();

  const handleSubmit = async (data: any) => {
    try {
      updateOrganization(
        {
          id: organization.id,
          ...data,
        },
        {
          onSuccess: () => {
            setIsOpen(false);
            onSuccess?.();
            console.log("Organisatie succesvol bijgewerkt");
          },
        }
      );
    } catch (error) {
      console.error("Error updating organization:", error);
      throw error;
    }
  };

  const formContent = (
    <Form
      schema={schemas.organization.update}
      onSubmit={handleSubmit}
      defaultValues={{
        name: organization.name || "",
        email: organization.email || "",
        phone_number: organization.phone_number || "",
        address: organization.address || "",
        city: organization.city || "",
        postal_code: organization.postal_code || "",
        kvk_number: organization.kvk_number || "",
        btw_number: organization.btw_number || "",
        website: organization.website || "",
        description: organization.description || "",
      }}
    >
      <div className="space-y-4">
        <FormInput
          name="name"
          label="Bedrijfsnaam"
          placeholder="Typ hier de bedrijfsnaam"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="email"
            label="E-mail"
            placeholder="bedrijf@example.com"
            type="email"
          />

          <FormInput
            name="phone_number"
            label="Telefoonnummer"
            placeholder="+31 6 12345678"
          />
        </div>

        <FormInput name="address" label="Adres" placeholder="Straatnaam 123" />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="postal_code"
            label="Postcode"
            placeholder="1234 AB"
          />

          <FormInput name="city" label="Plaats" placeholder="Amsterdam" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="kvk_number"
            label="KVK nummer"
            placeholder="12345678"
          />

          <FormInput
            name="btw_number"
            label="BTW nummer"
            placeholder="NL123456789B01"
          />
        </div>

        <FormInput
          name="website"
          label="Website"
          placeholder="https://www.example.com"
          type="url"
        />

        <FormTextarea
          name="description"
          label="Beschrijving"
          placeholder="Korte beschrijving van het bedrijf"
          rows={3}
        />

        <DialogFooter className="mt-2 flex flex-row justify-between">
          <DialogClose asChild>
            <Button variant="outline">Annuleren</Button>
          </DialogClose>
          <SubmitButton isLoading={isPending}>Opslaan</SubmitButton>
        </DialogFooter>
      </div>
    </Form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RiEditLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bedrijfsgegevens bewerken</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
