"use client";

import { useState } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiDeleteBinLine } from "@remixicon/react";
import type { Database } from "@/types/database";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];

interface SupplierDeleteFormProps {
  withDialog?: boolean;
  supplier: Supplier;
  onSuccess?: () => void;
}

export function SupplierDeleteForm({
  withDialog = false,
  supplier,
  onSuccess,
}: SupplierDeleteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSupplier, refetch } = useSuppliers();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteSupplier(supplier.id);
      await refetch();
      if (withDialog) {
        setIsOpen(false);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting supplier:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteContent = (
    <div className="space-y-6 p-2">
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Deze actie kan niet ongedaan worden gemaakt. Hiermee wordt de
          leverancier <strong>{supplier.name}</strong> definitief verwijderd.
        </p>
      </div>

      {withDialog && (
        <DialogFooter className="mt-2 flex flex-row justify-between">
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Annuleren
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            variant="default"
            className="bg-red-600 hover:bg-red-700"
          >
            Verwijder
          </Button>
        </DialogFooter>
      )}
      {!withDialog && (
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            variant="default"
            className="bg-red-600 hover:bg-red-700"
          >
            Verwijder
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
            <DialogTitle>Leverancier verwijderen</DialogTitle>
          </DialogHeader>
          {deleteContent}
        </DialogContent>
      </Dialog>
    );
  }

  return deleteContent;
}
