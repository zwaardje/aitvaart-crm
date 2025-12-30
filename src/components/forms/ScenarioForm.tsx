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
import { schemas, ScenarioFormData } from "@/lib/validation";
import { useCreateScenarioWithDefaults } from "@/hooks/useScenarios";
import { RiAddLine } from "@remixicon/react";

interface ScenarioFormProps {
  withDialog?: boolean;
  funeralId: string;
  onSuccess?: () => void;
  closeDialog?: () => void;
}

export function ScenarioForm({
  withDialog = false,
  closeDialog,
  funeralId,
  onSuccess,
}: ScenarioFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { createScenarioWithDefaults } = useCreateScenarioWithDefaults();

  const handleSubmit = async (data: ScenarioFormData) => {
    try {
      await createScenarioWithDefaults(data);
      if (withDialog) {
        setIsOpen(false);
      }
      if (closeDialog) {
        closeDialog();
      }
      onSuccess?.();
      console.log("Scenario item succesvol toegevoegd");
    } catch (error) {
      console.error("Error creating scenario item:", error);
      throw error;
    }
  };

  const formContent = (
    <Form
      schema={schemas.scenarios.create}
      onSubmit={handleSubmit}
      defaultValues={{
        funeral_id: funeralId,
        title: "",
        description: "",
      }}
    >
      <div className="space-y-4">
        <FormInput
          name="title"
          label="Titel"
          placeholder="Typ hier de titel van het item"
          required
        />

        <FormTextarea
          name="description"
          label="Opmerking"
          placeholder="Typ hier de opmerking over het item"
          rows={20}
        />

        <DialogFooter className="mt-2 flex flex-row justify-between">
          <DialogClose asChild>
            <Button variant="outline">Annuleren</Button>
          </DialogClose>
          <SubmitButton>Item toevoegen</SubmitButton>
        </DialogFooter>
      </div>
    </Form>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RiAddLine className="h-4 w-4 mr-2" />
            Item toevoegen
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nieuw scenario item</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
