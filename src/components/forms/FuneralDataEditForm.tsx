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

const funeralDataSchema = z.object({
  signing_date: schemas.common.date,
  funeral_time: schemas.common.time,
  location: schemas.common.optionalString,
});

type FuneralDataFormValues = z.infer<typeof funeralDataSchema>;

type FuneralRow = Database["public"]["Tables"]["funerals"]["Row"];

interface FuneralDataEditFormProps {
  funeral: FuneralRow;
  onSaved?: () => void;
}

export function FuneralDataEditForm({
  funeral,
  onSaved,
}: FuneralDataEditFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (values: FuneralDataFormValues) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("funerals")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", funeral.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["funerals"] });
      setIsOpen(false);
      onSaved?.();
    },
  });

  // Format time from database (HH:MM:SS) to input format (HH:MM)
  const formatTime = (time: string | null | undefined): string => {
    if (!time) return "";
    // If time is in HH:MM:SS format, extract HH:MM
    if (time.includes(":")) {
      const parts = time.split(":");
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  const defaultValues: FuneralDataFormValues = {
    signing_date: funeral.signing_date ?? "",
    funeral_time: formatTime(
      (funeral as any).funeral_time as string | null | undefined
    ),
    location: funeral.location ?? "",
  };

  const handleSubmit = async (values: FuneralDataFormValues) => {
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
          <DialogTitle>Uitvaartgegevens bewerken</DialogTitle>
        </DialogHeader>
        <Form
          schema={funeralDataSchema}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormInput
                name="signing_date"
                label="Uitvaartdatum"
                type="date"
              />
              <FormInput name="funeral_time" label="Uitvaarttijd" type="time" />
            </div>
            <FormInput name="location" label="Uitvaartlocatie" />
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
