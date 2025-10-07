"use client";

import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { FormSelect } from "./FormSelect";
import { SubmitButton } from "./SubmitButton";
import { schemas, CostFormData } from "@/lib/validation";
import {
  useCosts,
  useCreateCost,
  useSuppliersForCosts,
  useSupplierPricelists,
  useCreatePricelistItem,
} from "@/hooks";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  RiAddLine,
  RiSearchLine,
  RiStoreLine,
  RiAddCircleLine,
} from "@remixicon/react";

interface CostFormProps {
  withDialog?: boolean;
  funeralId: string;
  onSuccess?: () => void;
}

export function CostForm({
  withDialog = false,
  funeralId,
  onSuccess,
}: CostFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedPricelistItem, setSelectedPricelistItem] = useState<any>(null);

  const { createCostWithDefaults } = useCreateCost();
  const { refetch } = useCosts(funeralId);
  const { suppliers } = useSuppliersForCosts();
  const { pricelists } = useSupplierPricelists();
  const { createPricelistItem } = useCreatePricelistItem();

  const handleSubmit = async (data: CostFormData) => {
    try {
      await createCostWithDefaults({
        funeral_id: funeralId,
        supplier_id: data.supplier_id,
        product_name: data.product_name,
        quantity: data.quantity,
        unit_price: data.unit_price,
        notes: data.notes || null,
      });

      await refetch();
      if (withDialog) {
        setIsOpen(false);
      }
      setSearchTerm("");
      setSelectedPricelistItem(null);
      setMode("existing");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating cost:", error);
      throw error;
    }
  };

  const handleAddToPricelist = async (data: CostFormData) => {
    try {
      await createPricelistItem({
        supplier_id: data.supplier_id,
        product_name: data.product_name,
        base_price: data.unit_price,
        description: data.notes || null,
        unit: "per stuk",
      });

      // Also add to funeral costs
      await createCostWithDefaults({
        funeral_id: funeralId,
        supplier_id: data.supplier_id,
        product_name: data.product_name,
        quantity: data.quantity,
        unit_price: data.unit_price,
        notes: data.notes || null,
      });

      await refetch();
      if (withDialog) {
        setIsOpen(false);
      }
      setSearchTerm("");
      setSelectedPricelistItem(null);
      setMode("existing");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding to pricelist:", error);
      throw error;
    }
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter pricelists based on search term
  const filteredPricelists = pricelists.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formContent = (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "existing" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("existing")}
          className="flex items-center gap-2"
        >
          <RiStoreLine className="h-4 w-4" />
          {t("costs.selectExisting")}
        </Button>
        <Button
          type="button"
          variant={mode === "new" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("new")}
          className="flex items-center gap-2"
        >
          <RiAddCircleLine className="h-4 w-4" />
          {t("costs.addNew")}
        </Button>
      </div>

      {/* Search Field */}
      <div className="relative">
        <RiSearchLine className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={t("costs.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {mode === "existing" ? (
        /* Existing Products Selection */
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900">
            {t("costs.selectFromPricelist")}
          </h3>
          <div className="grid gap-3 max-h-60 overflow-y-auto">
            {filteredPricelists.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-colors ${
                  selectedPricelistItem?.id === item.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedPricelistItem(item)}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {item.supplier.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        €{item.base_price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.unit || "per stuk"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredPricelists.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <RiStoreLine className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t("costs.noProductsFound")}</p>
              </div>
            )}
          </div>

          {selectedPricelistItem && (
            <Form
              schema={schemas.costs.create}
              onSubmit={handleSubmit}
              defaultValues={{
                funeral_id: funeralId,
                supplier_id: selectedPricelistItem.supplier_id,
                product_name: selectedPricelistItem.product_name,
                quantity: "1",
                unit_price: String(selectedPricelistItem.base_price),
                notes: "",
              }}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="quantity"
                    label={t("costs.quantity")}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder={t("costs.quantityPlaceholder")}
                    required
                  />
                  <div className="relative">
                    <FormInput
                      name="unit_price"
                      label={t("costs.price")}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t("costs.pricePlaceholder")}
                      required
                    />
                    <span className="absolute left-3 top-8 text-gray-500">
                      €
                    </span>
                  </div>
                </div>

                <FormTextarea
                  name="notes"
                  label={t("costs.notes")}
                  placeholder={t("costs.notesPlaceholder")}
                  rows={3}
                />

                {withDialog && (
                  <DialogFooter className="mt-2">
                    <DialogClose asChild>
                      <Button variant="outline">Annuleren</Button>
                    </DialogClose>
                    <SubmitButton>{t("costs.addToBudget")}</SubmitButton>
                  </DialogFooter>
                )}
                {!withDialog && (
                  <div className="flex justify-end gap-2">
                    <SubmitButton>{t("costs.addToBudget")}</SubmitButton>
                  </div>
                )}
              </div>
            </Form>
          )}
        </div>
      ) : (
        /* New Product Form */
        <Form
          schema={schemas.costs.create}
          onSubmit={handleAddToPricelist}
          defaultValues={{
            funeral_id: funeralId,
            supplier_id: "",
            product_name: "",
            quantity: "1",
            unit_price: "0",
            notes: "",
          }}
        >
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
              {t("costs.addNewProduct")}
            </h3>

            <FormSelect
              name="supplier_id"
              label={t("costs.supplierName")}
              placeholder={t("costs.chooseSupplier")}
              options={filteredSuppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
              }))}
            />

            <FormInput
              name="product_name"
              label={t("costs.productName")}
              placeholder={t("costs.productNamePlaceholder")}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="quantity"
                label={t("costs.quantity")}
                type="number"
                step="0.01"
                min="0.01"
                placeholder={t("costs.quantityPlaceholder")}
                required
              />
              <div className="relative">
                <FormInput
                  name="unit_price"
                  label={t("costs.price")}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("costs.pricePlaceholder")}
                  required
                />
                <span className="absolute left-3 top-8 text-gray-500">€</span>
              </div>
            </div>

            <FormTextarea
              name="notes"
              label={t("costs.notes")}
              placeholder={t("costs.notesPlaceholder")}
              rows={3}
            />

            {withDialog && (
              <DialogFooter className="mt-2">
                <DialogClose asChild>
                  <Button variant="outline">Annuleren</Button>
                </DialogClose>
                <SubmitButton>{t("costs.addToPriceList")}</SubmitButton>
              </DialogFooter>
            )}
            {!withDialog && (
              <div className="flex justify-end gap-2">
                <SubmitButton>{t("costs.addToPriceList")}</SubmitButton>
              </div>
            )}
          </div>
        </Form>
      )}
    </div>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RiAddLine className="h-4 w-4 mr-2" />
            {t("costs.addCost")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("costs.addCost")}</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
