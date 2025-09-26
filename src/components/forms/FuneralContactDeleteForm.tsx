"use client";

import * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { SubmitButton } from "./SubmitButton";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiDeleteBinLine } from "@remixicon/react";

interface FuneralContactDeleteFormProps {
  contactFirstName: string;
  onConfirm: () => void | Promise<void>;
}

export function FuneralContactDeleteForm({
  contactFirstName,
  onConfirm,
}: FuneralContactDeleteFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" icon>
          <RiDeleteBinLine className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weet je het zeker?</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <p className="text-sm text-gray-500">
              Hiermee wordt uw item definitief verwijderd.
            </p>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              Verwijder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
