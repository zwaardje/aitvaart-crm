"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDocuments } from "@/hooks/useDocuments";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentsEditFormProps {
  document: Document;
  onSuccess?: () => void;
  withDialog?: boolean;
}

export function DocumentsEditForm({
  document,
  onSuccess,
  withDialog = false,
}: DocumentsEditFormProps) {
  const t = useTranslations();
  const { updateDocument, isUpdating } = useDocuments(document.funeral_id);
  const [isOpen, setIsOpen] = useState(false);

  const [fileName, setFileName] = useState(document.file_name);
  const [description, setDescription] = useState(document.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateDocument({
        id: document.id,
        updates: {
          file_name: fileName,
          description: description || null,
        },
      });
      if (withDialog) setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="fileName">Bestandsnaam</Label>
        <Input
          id="fileName"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Voer een bestandsnaam in..."
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Beschrijving (optioneel)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Voeg een beschrijving toe aan dit document..."
          rows={3}
          className="mt-2"
        />
      </div>

      {withDialog ? (
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuleren
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Opslaan..." : "Opslaan"}
          </Button>
        </DialogFooter>
      ) : (
        <div className="flex justify-end space-x-3">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      )}
    </form>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            Bewerken
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document bewerken</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
