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
import { Group } from "../ui/Group";

const contactAddressDataSchema = schemas.client.update.pick({
  street: true,
  house_number: true,
  house_number_addition: true,
  postal_code: true,
  city: true,
});

type ContactAddressDataFormValues = z.infer<typeof contactAddressDataSchema>;

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface ContactAddressDataEditFormProps {
  client: ClientRow;
  onSaved?: () => void;
}

export function ContactAddressDataEditForm({
  client,
  onSaved,
}: ContactAddressDataEditFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: ContactAddressDataFormValues) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("clients")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", client.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      await queryClient.invalidateQueries({ queryKey: ["funeral-contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["funerals"] });
      setIsOpen(false);
      onSaved?.();
    },
  });

  const defaultValues: ContactAddressDataFormValues = {
    street: client.street ?? "",
    house_number: client.house_number ?? "",
    house_number_addition: client.house_number_addition ?? "",
    postal_code: client.postal_code ?? "",
    city: client.city ?? "",
  };

  const handleSubmit = async (values: ContactAddressDataFormValues) => {
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
          schema={contactAddressDataSchema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        >
          <div className="space-y-4">
            <FormInput name="street" label="Straat" />
            <Group>
              <FormInput
                className="flex-1"
                name="house_number"
                label="Nummer"
              />
              <FormInput
                className="flex-1"
                name="house_number_addition"
                label="Toevoeging"
              />
            </Group>
            <Group>
              <FormInput
                className="flex-1"
                name="postal_code"
                label="Postcode"
              />
              <FormInput className="flex-1" name="city" label="Woonplaats" />
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
