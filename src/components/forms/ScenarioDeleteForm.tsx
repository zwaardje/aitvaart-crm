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
import { useDeleteScenario } from "@/hooks/useScenarios";
import { Database } from "@/types/database";
import { RiDeleteBinLine } from "@remixicon/react";

type FuneralScenario = Database["public"]["Tables"]["funeral_scenarios"]["Row"];

interface ScenarioDeleteFormProps {
  withDialog?: boolean;
  scenario: FuneralScenario;
  onSuccess?: () => void;
}

export function ScenarioDeleteForm({
  withDialog = false,
  scenario,
  onSuccess,
}: ScenarioDeleteFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: deleteScenario } = useDeleteScenario();

  const handleSubmit = async () => {
    try {
      await deleteScenario(scenario.id);
      if (withDialog) {
        setIsOpen(false);
      }
      onSuccess?.();
      console.log("Scenario item succesvol verwijderd");
    } catch (error) {
      console.error("Error deleting scenario item:", error);
      throw error;
    }
  };

  const formContent = (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Deze actie kan niet ongedaan worden gemaakt.
        </p>
        <p className="text-sm text-gray-500">
          Hiermee wordt uw item definitief verwijderd.
        </p>
      </div>

      <DialogFooter className="flex flex-row justify-between">
        <DialogClose asChild>
          <Button variant="outline">Annuleren</Button>
        </DialogClose>
        <Button type="button" onClick={handleSubmit} variant="default">
          Verwijder
        </Button>
      </DialogFooter>
    </div>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RiDeleteBinLine className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
