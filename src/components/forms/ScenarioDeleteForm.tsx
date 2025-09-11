"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Form } from "@/components/forms/Form";
import { useDeleteScenario } from "@/hooks/useScenarios";
import { Database } from "@/types/database";
import { RiDeleteBinLine } from "@remixicon/react";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

interface ScenarioDeleteFormProps {
  scenario: FuneralScenario;
  onSuccess?: () => void;
}

export function ScenarioDeleteForm({
  scenario,
  onSuccess,
}: ScenarioDeleteFormProps) {
  const t = useTranslations();
  const { mutateAsync: deleteScenario } = useDeleteScenario();

  const handleSubmit = async () => {
    try {
      await deleteScenario(scenario.id);
      onSuccess?.();
      console.log("Scenario item succesvol verwijderd");
    } catch (error) {
      console.error("Error deleting scenario item:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Deze actie kan niet ongedaan worden gemaakt.
        </p>
        <p className="text-sm text-gray-500">
          Hiermee wordt uw item definitief verwijderd.
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Annuleren
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          Verwijder
        </Button>
      </div>
    </div>
  );
}
