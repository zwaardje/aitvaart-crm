"use client";

import * as React from "react";
import { z } from "zod";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { SubmitButton } from "./SubmitButton";
import { Button, DialogClose, DialogFooter } from "@/components/ui";

interface FuneralContactDeleteFormProps {
  contactFirstName: string;
  onConfirm: () => void | Promise<void>;
}

export function FuneralContactDeleteForm({
  contactFirstName,
  onConfirm,
}: FuneralContactDeleteFormProps) {
  const schema = React.useMemo(() => {
    return z.object({
      confirm: z
        .string()
        .min(1, "Vul de voornaam in ter bevestiging")
        .refine((val) => val === contactFirstName, {
          message: "Naam komt niet overeen",
        }),
    }) as z.ZodSchema<any>;
  }, [contactFirstName]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Weet je het zeker?
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          Deze actie kan niet ongedaan worden gemaakt.
        </p>
        <p className="text-sm text-gray-500">
          Hiermee wordt uw item definitief verwijderd.
        </p>
      </div>

      <div className="flex justify-between">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Annuleren
          </Button>
        </DialogClose>
        <Button
          onClick={onConfirm}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          Verwijder
        </Button>
      </div>
    </div>
  );
}
