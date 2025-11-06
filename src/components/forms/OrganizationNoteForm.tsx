"use client";

import * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/forms/Form";
import { FormTextarea } from "./FormTextarea";
import { SubmitButton } from "./SubmitButton";
import { useUpdateOrganization } from "@/hooks/useOrganizations";
import { RiEditLine } from "@remixicon/react";

type OrganizationNoteFormProps = {
  organizationId: string;
  column: "description" | "wish_intake_notes" | "cost_estimate_notes";
  title: string;
  defaultValue?: string | null;
  onSuccess?: () => void;
};

const schema = z.object({
  value: z.string().optional().nullable(),
});

export function OrganizationNoteForm({
  organizationId,
  column,
  title,
  defaultValue,
  onSuccess,
}: OrganizationNoteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateOrganization, isPending } = useUpdateOrganization();

  function handleSubmit(data: z.infer<typeof schema>) {
    updateOrganization(
      { id: organizationId, [column]: data.value ?? null },
      {
        onSuccess: () => {
          setIsOpen(false);
          onSuccess?.();
        },
      }
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RiEditLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form
          schema={schema}
          onSubmit={handleSubmit}
          defaultValues={{ value: defaultValue ?? "" }}
        >
          <div className="space-y-4">
            <FormTextarea name="value" label={title} rows={8} />
            <DialogFooter className="mt-2 flex flex-row justify-between">
              <DialogClose asChild>
                <Button variant="outline">Annuleren</Button>
              </DialogClose>
              <SubmitButton isLoading={isPending}>Opslaan</SubmitButton>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
