"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/forms/Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { FormSelect } from "./FormSelect";
import { schemas, ScenarioFormData } from "@/lib/validation";
import { useCreateScenarioWithDefaults } from "@/hooks/useScenarios";
import { RiAddLine } from "@remixicon/react";

interface ScenarioFormProps {
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

export function ScenarioForm({ funeralId, onSuccess }: ScenarioFormProps) {
  const t = useTranslations();
  const { createScenarioWithDefaults } = useCreateScenarioWithDefaults();

  const handleSubmit = async (data: ScenarioFormData) => {
    try {
      await createScenarioWithDefaults(data);
      onSuccess?.();
      console.log("Scenario item succesvol toegevoegd");
    } catch (error) {
      console.error("Error creating scenario item:", error);
      throw error;
    }
  };

  return (
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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit">
            <RiAddLine className="h-4 w-4 mr-2" />
            Item toevoegen
          </Button>
        </div>
      </div>
    </Form>
  );
}
