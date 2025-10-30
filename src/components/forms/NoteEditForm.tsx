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
import { Button, DialogClose, DialogFooter } from "@/components/ui";
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
  withDialog?: boolean;
  note: FuneralNote;
  onSuccess?: () => void;
}

export function NoteEditForm({
  withDialog = false,
  note,
  onSuccess,
}: NoteEditFormProps) {
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
      if (withDialog) {
        setIsOpen(false);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  };

  const formContent = (
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

      {withDialog && (
        <DialogFooter className="mt-2 flex flex-row justify-between">
          <DialogClose asChild>
            <Button variant="outline">{t("common.cancel")}</Button>
          </DialogClose>
          <SubmitButton>{t("notes.updateNote")}</SubmitButton>
        </DialogFooter>
      )}
      {!withDialog && (
        <div className="flex justify-end gap-2 pt-4">
          <SubmitButton>{t("notes.updateNote")}</SubmitButton>
        </div>
      )}
    </Form>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" icon>
            <RiEditLine className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="">
            <DialogTitle>{t("notes.editNote")}</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
