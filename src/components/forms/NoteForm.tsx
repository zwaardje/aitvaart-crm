"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { FormCheckbox } from "./FormCheckbox";
import { SubmitButton } from "./SubmitButton";
import { schemas, NoteFormData } from "@/lib/validation";
import { useNotes, useCreateNote } from "@/hooks";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiAddLine } from "@remixicon/react";

interface NoteFormProps {
  funeralId: string;
  onSuccess?: () => void;
}

export function NoteForm({ funeralId, onSuccess }: NoteFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const { createNoteWithDefaults } = useCreateNote();
  const { refetch } = useNotes(funeralId);

  const handleSubmit = async (data: NoteFormData) => {
    try {
      await createNoteWithDefaults({
        funeral_id: funeralId,
        title: data.title,
        content: data.content,
        is_important: data.is_important || false,
      });

      await refetch();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RiAddLine className="h-4 w-4 mr-2" />
          {t("notes.addNote")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("notes.addNote")}</DialogTitle>
        </DialogHeader>

        <Form
          schema={schemas.notes.create}
          onSubmit={handleSubmit}
          defaultValues={{
            funeral_id: funeralId,
            is_important: false,
          }}
        >
          <div className="space-y-4">
            <FormInput
              name="title"
              label={t("notes.title")}
              placeholder={t("notes.titlePlaceholder")}
              required
            />

            <FormTextarea
              name="content"
              label={t("notes.content")}
              placeholder={t("notes.contentPlaceholder")}
              rows={6}
              required
            />

            <FormCheckbox name="is_important" label={t("notes.isImportant")} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <SubmitButton>{t("notes.createNote")}</SubmitButton>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
