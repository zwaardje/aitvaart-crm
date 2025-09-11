"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useDocuments } from "@/hooks/useDocuments";
import { Database } from "@/types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentsDeleteFormProps {
  document: Document;
  onSuccess?: () => void;
}

export function DocumentsDeleteForm({
  document,
  onSuccess,
}: DocumentsDeleteFormProps) {
  const t = useTranslations();
  const { deleteDocument, isDeleting } = useDocuments(document.funeral_id);

  const handleSubmit = async () => {
    try {
      await deleteDocument(document.id);
      onSuccess?.();
      console.log("Document succesvol verwijderd");
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Deze actie kan niet ongedaan worden gemaakt.
        </p>
        <p className="text-sm text-gray-500">
          Hiermee wordt het document "{document.file_name}" definitief
          verwijderd.
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Annuleren
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isDeleting}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          {isDeleting ? "Verwijderen..." : "Verwijder"}
        </Button>
      </div>
    </div>
  );
}
