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

const contactCommunicationSchema = schemas.client.update.pick({
  phone_number: true,
  email: true,
});

type ContactCommunicationFormValues = z.infer<
  typeof contactCommunicationSchema
>;

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface ContactCommunicationEditFormProps {
  client: ClientRow;
  onSaved?: () => void;
}

export function ContactCommunicationEditForm({
  client,
  onSaved,
}: ContactCommunicationEditFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: ContactCommunicationFormValues) => {
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

  const defaultValues: ContactCommunicationFormValues = {
    phone_number: client.phone_number ?? "",
    email: client.email ?? "",
  };

  const handleSubmit = async (values: ContactCommunicationFormValues) => {
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
          <DialogTitle>Communicatie bewerken</DialogTitle>
        </DialogHeader>
        <Form
          schema={contactCommunicationSchema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        >
          <Group>
            <FormInput
              className="flex-1"
              name="phone_number"
              label="Telefoonnummer"
            />
            <FormInput
              className="flex-1"
              name="email"
              label="E-mailadres"
              type="email"
            />
          </Group>
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
