"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/forms/Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { FormSelect } from "./FormSelect";
import { schemas, ScenarioUpdateFormData } from "@/lib/validation";
import { useUpdateScenario } from "@/hooks/useScenarios";
import { Database } from "@/types/database";
import { RiSaveLine } from "@remixicon/react";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

interface ScenarioEditFormProps {
  scenario: FuneralScenario;
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

export function ScenarioEditForm({
  scenario,
  onSuccess,
}: ScenarioEditFormProps) {
  const t = useTranslations();
  const { mutateAsync: updateScenario } = useUpdateScenario();

  const handleSubmit = async (data: ScenarioUpdateFormData) => {
    try {
      await updateScenario({ id: scenario.id, data });
      onSuccess?.();
      console.log("Scenario item succesvol bijgewerkt");
    } catch (error) {
      console.error("Error updating scenario item:", error);
      throw error;
    }
  };

  return (
    <Form
      schema={schemas.scenarios.update}
      onSubmit={handleSubmit}
      defaultValues={{
        section: scenario.section,
        item_type: scenario.item_type,
        title: scenario.title,
        description: scenario.description || "",
        extra_field_label: scenario.extra_field_label || "",
        extra_field_value: scenario.extra_field_value || "",
        order_in_section: scenario.order_in_section || 0,
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
            <RiSaveLine className="h-4 w-4 mr-2" />
            Wijzigingen opslaan
          </Button>
        </div>
      </div>
    </Form>
  );
}
