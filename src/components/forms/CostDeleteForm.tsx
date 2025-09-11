"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCosts } from "@/hooks";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { RiDeleteBinLine, RiAlertLine } from "@remixicon/react";
import type { Database } from "@/types/database";

type FuneralSupplier =
  Database["public"]["Tables"]["funeral_suppliers"]["Row"] & {
    supplier: Database["public"]["Tables"]["suppliers"]["Row"];
  };

interface CostDeleteFormProps {
  cost: FuneralSupplier;
  onSuccess?: () => void;
}

export function CostDeleteForm({ cost, onSuccess }: CostDeleteFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteCost, refetch } = useCosts(cost.funeral_id);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCost(cost.id);
      await refetch();
      setIsOpen(false);
      console.log("Kosten succesvol verwijderd");
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting cost:", error);
      alert(t("costs.deleteError") || "Fout bij het verwijderen van kosten");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <RiDeleteBinLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Weet je het zeker?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <p className="text-sm text-gray-500">
              Hiermee wordt uw item definitief verwijderd.
            </p>
          </div>

          <div className="flex justify-between">
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
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              Verwijder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
