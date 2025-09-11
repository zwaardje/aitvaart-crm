"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Database } from "@/types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentsEditFormProps {
  document: Document;
  onSuccess?: () => void;
}

export function DocumentsEditForm({
  document,
  onSuccess,
}: DocumentsEditFormProps) {
  const t = useTranslations();
  const { updateDocument, isUpdating } = useDocuments(document.funeral_id);

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
      onSuccess?.();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
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

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annuleren
        </Button>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Opslaan..." : "Opslaan"}
        </Button>
      </div>
    </form>
  );
}
