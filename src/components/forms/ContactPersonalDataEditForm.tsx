"use client";

import * as React from "react";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schemas } from "@/lib/validation";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { FormSwitch } from "./FormSwitch";
import { SubmitButton } from "./SubmitButton";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Group } from "@/components/ui/Group";
import { RiEditLine } from "@remixicon/react";
import type { Database } from "@/types/database";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const contactPersonalDataSchema = z.object({
  first_names: schemas.common.optionalString,
  preferred_name: z.string().min(1, "validation.preferredName.required"),
  last_name: z.string().min(1, "validation.lastName.required"),
  gender: schemas.common.gender,
  date_of_birth: schemas.common.date,
  place_of_birth: schemas.common.optionalString,
  marital_status: schemas.common.maritalStatus,
  relation: schemas.common.optionalString,
  is_primary: z.boolean().optional(),
});

type ContactPersonalDataFormValues = z.infer<typeof contactPersonalDataSchema>;

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type FuneralContactRow =
  Database["public"]["Tables"]["funeral_contacts"]["Row"];

interface ContactPersonalDataEditFormProps {
  client: ClientRow;
  funeralContact: FuneralContactRow;
  onSaved?: () => void;
}

export function ContactPersonalDataEditForm({
  client,
  funeralContact,
  onSaved,
}: ContactPersonalDataEditFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: ContactPersonalDataFormValues) => {
      const supabase = getSupabaseBrowser();

      // Update client record
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          first_names: values.first_names,
          preferred_name: values.preferred_name,
          last_name: values.last_name,
          gender: values.gender,
          date_of_birth: values.date_of_birth || null,
          place_of_birth: values.place_of_birth,
          marital_status: values.marital_status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", client.id);
      if (clientError) throw clientError;

      // If is_primary is being set to true, unset all other primary contacts for this funeral
      if (values.is_primary) {
        await supabase
          .from("funeral_contacts")
          .update({ is_primary: false })
          .eq("funeral_id", funeralContact.funeral_id)
          .neq("id", funeralContact.id);
      }

      // Update funeral_contacts record
      const { error: contactError } = await supabase
        .from("funeral_contacts")
        .update({
          relation: values.relation,
          is_primary: values.is_primary ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", funeralContact.id);
      if (contactError) throw contactError;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["funeral-contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      await queryClient.invalidateQueries({ queryKey: ["funerals"] });
      setIsOpen(false);
      onSaved?.();
    },
  });

  const defaultValues: ContactPersonalDataFormValues = {
    first_names: (client as any).first_names ?? "",
    preferred_name: client.preferred_name ?? "",
    last_name: client.last_name ?? "",
    gender:
      (client.gender as "male" | "female" | "other" | undefined) ?? undefined,
    date_of_birth: client.date_of_birth ?? "",
    place_of_birth: client.place_of_birth ?? "",
    marital_status:
      ((client as any).marital_status as
        | "single"
        | "married"
        | "divorced"
        | "widowed"
        | "registered_partnership"
        | undefined) ?? undefined,
    relation: funeralContact.relation ?? "",
    is_primary: funeralContact.is_primary ?? false,
  };

  const handleSubmit = async (values: ContactPersonalDataFormValues) => {
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
          <DialogTitle>Persoonsgegevens bewerken</DialogTitle>
        </DialogHeader>
        <Form
          schema={contactPersonalDataSchema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        >
          <div className="space-y-4">
            <Group>
              <FormInput
                className="flex-1"
                name="first_names"
                label="Voornamen"
              />
              <FormInput
                className="flex-1"
                name="preferred_name"
                label="Roepnaam"
              />
              <FormInput
                className="flex-1"
                name="last_name"
                label="Achternaam"
              />
            </Group>
            <Group>
              <FormSelect
                className="flex-1"
                name="gender"
                label="Geslacht"
                options={[
                  { value: "male", label: "Man" },
                  { value: "female", label: "Vrouw" },
                  { value: "other", label: "Anders" },
                ]}
                placeholder="Kies geslacht"
              />
              <FormSelect
                className="flex-1"
                name="marital_status"
                label="Burgerlijke staat"
                options={[
                  { value: "single", label: "Ongehuwd" },
                  { value: "married", label: "Getrouwd" },
                  { value: "divorced", label: "Gescheiden" },
                  { value: "widowed", label: "Weduwe/Weduwnaar" },
                  {
                    value: "registered_partnership",
                    label: "Geregistreerd partnerschap",
                  },
                ]}
                placeholder="Kies burgerlijke staat"
              />
            </Group>
            <Group>
              <FormInput
                className="flex-1"
                name="date_of_birth"
                label="Geboortedatum"
                type="date"
              />
              <FormInput
                className="flex-1"
                name="place_of_birth"
                label="Geboorteplaats"
              />
            </Group>
            <Group>
              <FormInput
                className="flex-1"
                name="relation"
                label="Relatie tot overledene"
              />
              <FormSwitch
                className="flex-1"
                name="is_primary"
                label="Opdrachtgever"
              />
            </Group>
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
