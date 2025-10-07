"use client";

import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { schemas, ScenarioUpdateFormData } from "@/lib/validation";
import { useUpdateScenario } from "@/hooks/useScenarios";
import { Database } from "@/types/database";
import { RiEditLine } from "@remixicon/react";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

interface ScenarioEditFormProps {
  withDialog?: boolean;
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
  withDialog = false,
  scenario,
  onSuccess,
}: ScenarioEditFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: updateScenario } = useUpdateScenario();

  const handleSubmit = async (data: ScenarioUpdateFormData) => {
    try {
      await updateScenario({ id: scenario.id, data });
      if (withDialog) {
        setIsOpen(false);
      }
      onSuccess?.();
      console.log("Scenario item succesvol bijgewerkt");
    } catch (error) {
      console.error("Error updating scenario item:", error);
      throw error;
    }
  };

  const formContent = (
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

        {withDialog && (
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline">Annuleren</Button>
            </DialogClose>
            <SubmitButton>Wijzigingen opslaan</SubmitButton>
          </DialogFooter>
        )}
        {!withDialog && (
          <div className="flex justify-end gap-2 pt-4">
            <SubmitButton>Wijzigingen opslaan</SubmitButton>
          </div>
        )}
      </div>
    </Form>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RiEditLine className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Item wijzigen</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
