"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { FormSelect } from "./FormSelect";
import { SubmitButton } from "./SubmitButton";
import { schemas, CostUpdateFormData } from "@/lib/validation";
import { useCosts, useSuppliersForCosts } from "@/hooks";
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

type FuneralSupplier =
  Database["public"]["Tables"]["funeral_suppliers"]["Row"] & {
    supplier: Database["public"]["Tables"]["suppliers"]["Row"];
  };

interface CostEditFormProps {
  cost: FuneralSupplier;
  onSuccess?: () => void;
}

export function CostEditForm({ cost, onSuccess }: CostEditFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const { updateCost, refetch } = useCosts(cost.funeral_id);
  const { suppliers } = useSuppliersForCosts();

  const handleSubmit = async (data: CostUpdateFormData) => {
    try {
      await updateCost(cost.id, {
        supplier_id: data.supplier_id || cost.supplier_id,
        product_name: data.product_name || cost.product_name,
        quantity: data.quantity || cost.quantity || 1,
        unit_price: data.unit_price || cost.unit_price,
        notes: data.notes || cost.notes,
      });

      await refetch();
      setIsOpen(false);
      console.log("Kosten succesvol bijgewerkt");
      onSuccess?.();
    } catch (error) {
      console.error("Error updating cost:", error);
      alert(t("costs.updateError") || "Fout bij het bijwerken van kosten");
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
          <DialogTitle>{t("costs.editCost")}</DialogTitle>
        </DialogHeader>

        <Form
          schema={schemas.costs.update}
          onSubmit={handleSubmit}
          defaultValues={{
            supplier_id: cost.supplier_id,
            product_name: cost.product_name,
            quantity: String(cost.quantity || 1),
            unit_price: String(cost.unit_price),
            notes: cost.notes || "",
          }}
        >
          <div className="space-y-4">
            {/* Supplier Selection */}
            <FormSelect
              name="supplier_id"
              label={t("costs.supplierName")}
              placeholder={t("costs.chooseSupplier")}
              options={suppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
              }))}
            />

            {/* Product Name */}
            <FormInput
              name="product_name"
              label={t("costs.productName")}
              placeholder={t("costs.productNamePlaceholder")}
            />

            {/* Quantity and Price Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="quantity"
                label={t("costs.quantity")}
                type="number"
                step="0.01"
                min="0.01"
                placeholder={t("costs.quantityPlaceholder")}
              />
              <div className="relative">
                <FormInput
                  name="unit_price"
                  label={t("costs.price")}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("costs.pricePlaceholder")}
                />
                <span className="absolute left-3 top-8 text-gray-500">€</span>
              </div>
            </div>

            {/* Notes */}
            <FormTextarea
              name="notes"
              label={t("costs.notes")}
              placeholder={t("costs.notesPlaceholder")}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <SubmitButton>{t("costs.updateCost")}</SubmitButton>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
