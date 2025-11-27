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

const personalDataSchema = schemas.deceased.update.pick({
  first_names: true,
  preferred_name: true,
  last_name: true,
  gender: true,
  date_of_birth: true,
  place_of_birth: true,
  social_security_number: true,
  marital_status: true,
});

type PersonalDataFormValues = z.infer<typeof personalDataSchema>;

type DeceasedRow = Database["public"]["Tables"]["deceased"]["Row"];

interface PersonalDataEditFormProps {
  deceased: DeceasedRow;
  onSaved?: () => void;
}

export function PersonalDataEditForm({
  deceased,
  onSaved,
}: PersonalDataEditFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: PersonalDataFormValues) => {
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

  const defaultValues: PersonalDataFormValues = {
    first_names: deceased.first_names ?? "",
    preferred_name: deceased.preferred_name ?? "",
    last_name: deceased.last_name ?? "",
    gender:
      (deceased.gender as "male" | "female" | "other" | undefined) ?? undefined,
    date_of_birth: deceased.date_of_birth ?? "",
    place_of_birth: deceased.place_of_birth ?? "",
    social_security_number: deceased.social_security_number ?? "",
    marital_status:
      (deceased.marital_status as
        | "single"
        | "married"
        | "divorced"
        | "widowed"
        | "registered_partnership"
        | undefined) ?? undefined,
  };

  const handleSubmit = async (values: PersonalDataFormValues) => {
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
          schema={personalDataSchema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormInput name="first_names" label="Voornamen" />
              <FormInput name="preferred_name" label="Roepnaam" />
              <FormInput name="last_name" label="Achternaam" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <FormSelect
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput
                name="date_of_birth"
                label="Geboortedatum"
                type="date"
              />
              <FormInput name="place_of_birth" label="Geboorteplaats" />
            </div>
            <FormInput name="social_security_number" label="BSN" />
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
