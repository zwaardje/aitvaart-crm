"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { FormCheckbox } from "./FormCheckbox";
import { SubmitButton } from "./SubmitButton";
import { schemas, NoteUpdateFormData } from "@/lib/validation";
import { useNotes } from "@/hooks";
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

type FuneralNote = Database["public"]["Tables"]["funeral_notes"]["Row"];

interface NoteEditFormProps {
  note: FuneralNote;
  onSuccess?: () => void;
}

export function NoteEditForm({ note, onSuccess }: NoteEditFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const { updateNote, refetch } = useNotes(note.funeral_id);

  const handleSubmit = async (data: NoteUpdateFormData) => {
    try {
      await updateNote(note.id, {
        title: data.title,
        content: data.content,
        is_important: data.is_important || false,
      });

      await refetch();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <RiEditLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("notes.editNote")}</DialogTitle>
        </DialogHeader>

        <Form
          schema={schemas.notes.update}
          onSubmit={handleSubmit}
          defaultValues={{
            title: note.title,
            content: note.content,
            is_important: note.is_important || false,
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
            <SubmitButton>{t("notes.updateNote")}</SubmitButton>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
