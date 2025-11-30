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
import {
  SECTION_OPTIONS,
  ITEM_TYPE_OPTIONS,
} from "@/constants/scenario-labels";
import { Group } from "@/components/ui/Group";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

interface ScenarioEditFormProps {
  withDialog?: boolean;
  scenario: FuneralScenario;
  onSuccess?: () => void;
}

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
        <Group>
          <FormSelect
            className="flex-1"
            name="section"
            label="Sectie"
            placeholder="Kies sectie"
            options={SECTION_OPTIONS}
          />

          <FormSelect
            className="flex-1"
            name="item_type"
            label="Item type"
            placeholder="Kies item type"
            options={ITEM_TYPE_OPTIONS}
          />
        </Group>

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
          rows={8}
        />

        <Group title="Extra informatie">
          <FormInput
            className="flex-1"
            name="extra_field_label"
            label="Extra veld label"
            placeholder="Bijv. Verzorglocatie, Opbaarlocatie"
          />

          <FormInput
            className="flex-1"
            name="extra_field_value"
            label="Extra veld waarde"
            placeholder="Typ hier de waarde van het extra veld"
          />
        </Group>

        {withDialog && (
          <DialogFooter className="mt-2 flex flex-row justify-between">
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
