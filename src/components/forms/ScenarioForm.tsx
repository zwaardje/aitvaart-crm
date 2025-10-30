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
import { FormSelect } from "./FormSelect";
import { SubmitButton } from "./SubmitButton";
import { schemas, ScenarioFormData } from "@/lib/validation";
import { useCreateScenarioWithDefaults } from "@/hooks/useScenarios";
import { RiAddLine } from "@remixicon/react";

interface ScenarioFormProps {
  withDialog?: boolean;
  funeralId: string;
  onSuccess?: () => void;
}

const SECTION_OPTIONS = [
  { value: "soort_uitvaart", label: "Soort uitvaart" },
  { value: "verzorging_en_opbaring", label: "Verzorging en opbaring" },
  { value: "ceremonie", label: "Ceremonie" },
  { value: "kosten", label: "Kosten" },
];

const ITEM_TYPE_OPTIONS = [
  { value: "begrafenis", label: "Begrafenis" },
  { value: "crematie", label: "Crematie" },
  { value: "laatste_verzorging", label: "Laatste verzorging" },
  { value: "thanatopraxie", label: "Thanatopraxie" },
  { value: "opbaring", label: "Opbaring" },
  { value: "ceremonie", label: "Ceremonie" },
  { value: "muziek", label: "Muziek" },
  { value: "bloemen", label: "Bloemen" },
  { value: "transport", label: "Transport" },
];

export function ScenarioForm({
  withDialog = false,
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
        section: "",
        item_type: "",
        title: "",
        description: "",
        extra_field_label: "",
        extra_field_value: "",
        order_in_section: 0,
      }}
    >
      <div className="space-y-4">
        <FormSelect
          name="section"
          label="Sectie"
          placeholder="Kies sectie"
          options={SECTION_OPTIONS}
        />

        <FormSelect
          name="item_type"
          label="Item type"
          placeholder="Kies item type"
          options={ITEM_TYPE_OPTIONS}
        />

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
          rows={3}
        />

        <FormInput
          name="extra_field_label"
          label="Extra veld label"
          placeholder="Bijv. Verzorglocatie, Opbaarlocatie"
        />

        <FormInput
          name="extra_field_value"
          label="Extra veld waarde"
          placeholder="Typ hier de waarde van het extra veld"
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
