"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  FuneralContactForm,
  FuneralContactFormValues,
} from "./FuneralContactForm";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiEditLine } from "@remixicon/react";
import type { Database } from "@/types/database";

type FuneralContact =
  Database["public"]["Tables"]["funeral_contacts"]["Row"] & {
    client: Database["public"]["Tables"]["clients"]["Row"] | null;
  };

interface FuneralContactEditFormProps {
  contact: FuneralContact;
  onSuccess?: () => void;
  onEdit: (
    contact: FuneralContact,
    data: FuneralContactFormValues
  ) => void | Promise<void>;
}

export function FuneralContactEditForm({
  contact,
  onSuccess,
  onEdit,
}: FuneralContactEditFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: FuneralContactFormValues) => {
    try {
      await onEdit(contact, data);
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" icon>
          <RiEditLine className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact bewerken</DialogTitle>
        </DialogHeader>

        <FuneralContactForm
          defaultValues={{
            preferred_name: contact.client?.preferred_name ?? "",
            last_name: contact.client?.last_name ?? "",
            email: contact.client?.email ?? "",
            phone_number: contact.client?.phone_number ?? "",
            relation: contact.relation ?? "",
            is_primary: !!contact.is_primary,
          }}
          onSubmit={handleSubmit}
          submitLabel="Opslaan"
        />
      </DialogContent>
    </Dialog>
  );
}
