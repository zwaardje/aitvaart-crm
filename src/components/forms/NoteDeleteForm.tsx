"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useNotes } from "@/hooks";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiDeleteBinLine } from "@remixicon/react";
import type { Database } from "@/types/database";

type FuneralNote = Database["public"]["Tables"]["funeral_notes"]["Row"];

interface NoteDeleteFormProps {
  note: FuneralNote;
  onSuccess?: () => void;
}

export function NoteDeleteForm({ note, onSuccess }: NoteDeleteFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteNote, refetch } = useNotes(note.funeral_id);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteNote(note.id);
      await refetch();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" icon>
          <RiDeleteBinLine />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-y-auto h-full">
        <DialogHeader>
          <DialogTitle>Weet je het zeker?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Deze actie kan niet ongedaan worden gemaakt. Hiermee wordt uw item
              definitief verwijderd.
            </p>
          </div>

          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annuleren
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              Verwijder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
