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

const deathDataSchema = schemas.deceased.update.pick({
  date_of_death: true,
  place_of_death: true,
  coffin_registration_number: true,
});

type DeathDataFormValues = z.infer<typeof deathDataSchema>;

type DeceasedRow = Database["public"]["Tables"]["deceased"]["Row"];

interface DeathDataEditFormProps {
  deceased: DeceasedRow;
  onSaved?: () => void;
}

export function DeathDataEditForm({
  deceased,
  onSaved,
}: DeathDataEditFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: DeathDataFormValues) => {
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

  const defaultValues: DeathDataFormValues = {
    date_of_death: deceased.date_of_death ?? "",
    place_of_death: deceased.place_of_death ?? "",
    coffin_registration_number: deceased.coffin_registration_number ?? "",
  };

  const handleSubmit = async (values: DeathDataFormValues) => {
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
          <DialogTitle>Overlijdensgegevens bewerken</DialogTitle>
        </DialogHeader>
        <Form
          schema={deathDataSchema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput
                name="date_of_death"
                label="Datum overlijden"
                type="date"
              />
              <FormInput name="place_of_death" label="Plaats van overlijden" />
            </div>
            <FormInput
              name="coffin_registration_number"
              label="Kistregistratienummer"
            />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Annuleren</Button>
            </DialogClose>
            <SubmitButton>Opslaan</SubmitButton>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
