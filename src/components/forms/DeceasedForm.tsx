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
import { FormGroup } from "./FormGroup";

export const deceasedFormSchema = schemas.deceased.update;
export type DeceasedFormValues = z.infer<typeof deceasedFormSchema>;

type DeceasedRow = Database["public"]["Tables"]["deceased"]["Row"];

interface DeceasedFormProps {
  deceased: DeceasedRow;
  submitLabel?: string;
  onSaved?: () => void;
  withDialog?: boolean;
}

export function DeceasedForm({
  deceased,
  submitLabel = "Opslaan",
  onSaved,
  withDialog = false,
}: DeceasedFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
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
      if (withDialog) setIsOpen(false);
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

  const handleSubmit = async (values: DeceasedFormValues) => {
    await updateMutation.mutateAsync(values);
  };

  const formContent = (
    <Form
      schema={deceasedFormSchema}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormGroup title="Persoonsgegevens">
          <div className="flex  gap-3">
            <FormInput name="first_names" label="Voornamen" />
            <FormInput name="preferred_name" label="Roepnaam" />
            <FormInput name="last_name" label="Achternaam" />
          </div>
          <div className="flex gap-3 items-center">
            <FormSelect
              className="w-full flex-1"
              name="gender"
              label="Geslacht"
              options={[
                { value: "male", label: "Man" },
                { value: "female", label: "Vrouw" },
                { value: "other", label: "Anders" },
              ]}
              placeholder="Kies geslacht"
            />

            <FormInput
              className="w-full flex-1"
              name="date_of_birth"
              label="Geboortedatum"
              type="date"
            />
            <FormInput
              className="w-full flex-2"
              name="place_of_birth"
              label="Geboorteplaats"
            />
          </div>
        </FormGroup>
        <FormGroup title="Overlijdensgegevens">
          <div className="flex gap-3">
            <FormInput
              className="w-full flex-1"
              name="date_of_death"
              label="Overlijdensdatum"
              type="date"
            />
            <FormInput
              className="w-full flex-2"
              name="coffin_registration_number"
              label="Kistregistratienummer"
            />
          </div>
        </FormGroup>

        <FormGroup title="Adresgegevens">
          <div className="flex gap-3">
            <FormInput className="w-full flex-2" name="street" label="Straat" />

            <FormInput
              className="w-full flex-1"
              name="house_number"
              label="Huisnummer"
            />
            <FormInput
              className="w-full flex-1"
              name="house_number_addition"
              label="Toevoeging"
            />
          </div>
          <div className="flex gap-3">
            <FormInput
              className="w-full flex-1"
              name="postal_code"
              label="Postcode"
            />

            <FormInput className="w-full flex-1" name="city" label="Plaats" />
          </div>
        </FormGroup>
      </div>
      {withDialog ? (
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="outline">Annuleren</Button>
          </DialogClose>
          <SubmitButton>{submitLabel}</SubmitButton>
        </DialogFooter>
      ) : (
        <div className="flex justify-end gap-2 pt-4">
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      )}
    </Form>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" icon>
            <RiEditLine className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Overledene bewerken</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
