"use client";

import { useTranslations } from "next-intl";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { RiDeleteBinLine } from "@remixicon/react";
import { useDocuments } from "@/hooks/useDocuments";
import { Database } from "@/types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentsDeleteFormProps {
  document: Document;
  onSuccess?: () => void;
  withDialog?: boolean;
}

export function DocumentsDeleteForm({
  document,
  onSuccess,
  withDialog = false,
}: DocumentsDeleteFormProps) {
  const t = useTranslations();
  const { deleteDocument, isDeleting } = useDocuments(document.funeral_id);
  const [isOpen, setIsOpen] = useState(false);

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

  const deleteContent = (
    <div className="space-y-6 p-2">
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Deze actie kan niet ongedaan worden gemaakt.
        </p>
        <p className="text-sm text-gray-500">
          Hiermee wordt het document &quot;{document.file_name}&quot; definitief
          verwijderd.
        </p>
      </div>

      {withDialog ? (
        <DialogFooter className="mt-2 flex flex-row justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isDeleting}>
              Annuleren
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Verwijderen..." : "Verwijder"}
          </Button>
        </DialogFooter>
      ) : (
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Verwijderen..." : "Verwijder"}
          </Button>
        </div>
      )}
    </div>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" icon>
            <RiDeleteBinLine />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document verwijderen</DialogTitle>
          </DialogHeader>
          {deleteContent}
        </DialogContent>
      </Dialog>
    );
  }

  return deleteContent;
}
