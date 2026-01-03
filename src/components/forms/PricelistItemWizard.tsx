"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { FormSelect } from "./FormSelect";
import {
  Wizard,
  WizardStep,
  WizardNavigation,
  WizardProgress,
} from "@/components/ui/Wizard";
import { DialogFooter } from "@/components/ui";
import { useWizardErrorNavigation } from "@/hooks/useWizardErrorNavigation";
import type { FieldToStepMap } from "@/types/wizard";
import { WizardErrorProvider } from "./WizardErrorContext";
import { schemas, PricelistItemWizardFormData } from "@/lib/validation";
import { usePricelist } from "@/hooks/usePricelist";
import { useSuppliers } from "@/hooks/useSuppliers";
import {
  CATEGORY_OPTIONS,
  getSubcategoryOptions,
} from "@/constants/pricelist-categories";
import { calculatePriceExcl, calculatePriceIncl } from "@/lib/price-utils";
import { Group } from "@/components/ui/Group";
import { FormGroup } from "./FormGroup";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const pricelistItemFieldToStepMap: FieldToStepMap = {
  // Stap 1: Informatie
  title: 1,
  description: 1,
  website_url: 1,
  default_quantity: 1,
  vat_rate: 1,
  price_incl: 1,
  category: 1,
  subcategory: 1,
  ai_remark: 1,
  // Stap 2: Leverancier
  supplier_id: 2,
  "supplier.name": 2,
  "supplier.address": 2,
  "supplier.postal_code": 2,
  "supplier.city": 2,
  "supplier.phone_number": 2,
  "supplier.email": 2,
  "supplier.website": 2,
  save_supplier: 2,
};

interface PricelistItemWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PricelistItemWizard({
  open,
  onOpenChange,
  onSuccess,
}: PricelistItemWizardProps) {
  const { createItem, isCreating } = usePricelist();
  const { suppliers, createSupplier } = useSuppliers();

  const handleSubmit = async (values: PricelistItemWizardFormData) => {
    try {
      let supplierId = values.supplier_id;

      // Als er een nieuwe leverancier wordt aangemaakt en opgeslagen
      if (values.supplier && !supplierId && values.save_supplier) {
        await new Promise<void>((resolve, reject) => {
          createSupplier(
            {
              name: values.supplier!.name,
              address: values.supplier!.address || null,
              postal_code: values.supplier!.postal_code || null,
              city: values.supplier!.city || null,
              phone_number: values.supplier!.phone_number || null,
              email: values.supplier!.email || null,
            },
            {
              onSuccess: (data) => {
                supplierId = data.id;
                resolve();
              },
              onError: reject,
            }
          );
        });
      }

      // Maak prijslijstitem aan
      await new Promise<void>((resolve, reject) => {
        createItem(
          {
            title: values.title,
            subtitle: undefined,
            description: values.description || null,
            default_quantity: values.default_quantity,
            price_incl: values.price_incl,
            vat_rate: values.vat_rate || null,
            unit: null,
            category: values.category || null,
            subcategory: values.subcategory || null,
            website_url: values.website_url || null,
            ai_remark: values.ai_remark || null,
            supplier_id: supplierId || null,
          } as any,
          {
            onSuccess: () => {
              resolve();
              onOpenChange(false);
              onSuccess?.();
            },
            onError: reject,
          }
        );
      });
    } catch (error) {
      console.error("Error creating pricelist item:", error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuw prijslijst item</DialogTitle>
        </DialogHeader>
        <Form
          schema={schemas.pricelistItem.wizard}
          onSubmit={handleSubmit}
          canWatchErrors={true}
          defaultValues={{
            title: "",
            description: "",
            website_url: "",
            default_quantity: 1,
            vat_rate: 9,
            price_incl: 0,
            category: undefined,
            subcategory: undefined,
            supplier_id: undefined,
            supplier_mode: undefined,
            supplier: undefined,
            save_supplier: false,
          }}
        >
          <PricelistItemWizardWrapper
            suppliers={suppliers}
            onOpenChange={onOpenChange}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PricelistItemWizardWrapper({
  suppliers,
  onOpenChange,
}: {
  suppliers: Array<{ id: string; name: string }>;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Wizard totalSteps={2}>
      <PricelistItemWizardWithErrorHandler
        suppliers={suppliers}
        onOpenChange={onOpenChange}
      />
    </Wizard>
  );
}

function PricelistItemWizardWithErrorHandler({
  suppliers,
  onOpenChange,
}: {
  suppliers: Array<{ id: string; name: string }>;
  onOpenChange: (open: boolean) => void;
}) {
  const handleError = useWizardErrorNavigation(pricelistItemFieldToStepMap);

  return (
    <WizardErrorProvider onError={handleError}>
      <PricelistItemWizardContent
        suppliers={suppliers}
        onOpenChange={onOpenChange}
      />
    </WizardErrorProvider>
  );
}

function PricelistItemWizardContent({
  suppliers,
  onOpenChange,
}: {
  suppliers: Array<{ id: string; name: string }>;
  onOpenChange: (open: boolean) => void;
}) {
  const { watch, setValue } = useFormContext<PricelistItemWizardFormData>();
  const vatRate = watch("vat_rate") || 0;
  const priceIncl = watch("price_incl") || 0;
  const category = watch("category");
  const subcategoryOptions = useMemo(
    () => getSubcategoryOptions(category),
    [category]
  );
  const supplierMode = watch("supplier_mode") as "existing" | "new" | undefined;
  const selectedSupplierId = watch("supplier_id");

  // Watch supplier_id changes and update supplier_mode accordingly
  useEffect(() => {
    // Als er een UUID is geselecteerd (niet "new" of undefined), is het een bestaande leverancier
    if (
      selectedSupplierId &&
      selectedSupplierId !== "new" &&
      selectedSupplierId.includes("-")
    ) {
      // UUID format detected - existing supplier
      setValue("supplier_mode", "existing");
      // Reset supplier object when existing supplier is selected
      setValue("supplier", undefined);
    } else if (selectedSupplierId === "new" || !selectedSupplierId) {
      // Nieuwe leverancier modus
      setValue("supplier_mode", "new");
      // Don't reset supplier object, user is entering new supplier
    }
  }, [selectedSupplierId, setValue]);

  // Bereken prijs excl. uit prijs incl.
  const calculatedPriceExcl = useMemo(() => {
    if (priceIncl > 0 && vatRate >= 0) {
      return calculatePriceExcl(priceIncl, vatRate);
    }
    return 0;
  }, [priceIncl, vatRate]);

  // Bereken prijs incl. uit prijs excl. (als handmatig ingevoerd)
  const handlePriceExclChange = (value: number) => {
    if (value > 0 && vatRate >= 0) {
      const newPriceIncl = calculatePriceIncl(value, vatRate);
      setValue("price_incl", newPriceIncl);
    }
  };

  const supplierOptions = useMemo(() => {
    return [
      { value: "new", label: "Nieuwe leverancier" },
      ...suppliers.map((s) => ({ value: s.id, label: s.name })),
    ];
  }, [suppliers]);

  return (
    <>
      <WizardProgress />
      <WizardStep step={1}>
        <FormGroup title="Informatie">
          <Group>
            <FormSelect
              name="category"
              label="Categorie"
              options={CATEGORY_OPTIONS}
              placeholder="Selecteer categorie"
              className="w-full"
            />
            {category ? (
              <FormSelect
                name="subcategory"
                label="Subcategorie"
                options={subcategoryOptions}
                placeholder="Selecteer subcategorie"
                className="w-full"
              />
            ) : (
              <div className="w-full">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Subcategorie
                </label>
                <div className="h-9 px-3 py-2 text-xs bg-gray-50 border rounded-md text-gray-400">
                  Selecteer eerst categorie
                </div>
              </div>
            )}
          </Group>
          <FormInput
            name="title"
            label="Titel"
            placeholder="Bijv. Populierenhout uitvaartkist"
            required
          />
          <FormTextarea
            name="description"
            label="Omschrijving"
            placeholder="Bijv. Uitvaartkist populierenhout met zes losse grepen"
            rows={3}
            required
          />

          <FormInput
            name="website_url"
            label="Website URL"
            placeholder="www.vanwijk.nl/pioen403"
            type="url"
          />
          <Group>
            <FormInput
              name="vat_rate"
              label="btw %"
              type="number"
              min={0}
              max={100}
              step={0.01}
              defaultValue={9}
              className="w-full"
            />

            <div className="w-full">
              <FormInput
                name="price_incl"
                label="Prijs incl."
                type="number"
                min={0}
                step={0.01}
                suffix={<span className="text-xs text-gray-500">€</span>}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setValue("price_incl", value);
                }}
              />
              {calculatedPriceExcl > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Prijs excl.: €{calculatedPriceExcl.toFixed(2)}
                </p>
              )}
            </div>
          </Group>
        </FormGroup>
      </WizardStep>

      <WizardStep step={2}>
        <FormGroup title="Leverancier">
          <FormSelect
            name="supplier_id"
            label="Kies leverancier"
            options={supplierOptions}
            placeholder="Selecteer leverancier"
          />

          {(selectedSupplierId === undefined ||
            supplierMode === "new" ||
            watch("supplier_id") === "new") && (
            <>
              <div className="pt-4 space-y-4 border-t">
                <FormInput
                  name="supplier.name"
                  label="Naam leverancier*"
                  placeholder="Bijv. Van Wijk Uitvaartkisten"
                  required
                />
                <FormInput
                  name="supplier.address"
                  label="Straatnaam en huisnummer"
                  placeholder="Bijv. Amazonenlaan 41"
                />
                <Group>
                  <FormInput
                    name="supplier.postal_code"
                    label="Postcode"
                    placeholder="5631 KX"
                    className="w-full"
                  />
                  <FormInput
                    name="supplier.city"
                    label="Plaats"
                    placeholder="Eindhoven"
                    className="w-full"
                  />
                </Group>
                <FormInput
                  name="supplier.phone_number"
                  label="Telefoonnummer 1"
                  placeholder="010 450 23 33"
                />
                <FormInput
                  name="supplier.email"
                  label="E-mailadres"
                  placeholder="info@vanwijk.nl"
                  type="email"
                />
                <FormInput
                  name="supplier.website"
                  label="Website"
                  placeholder="www.vanwijk.nl"
                  type="url"
                />
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="save_supplier"
                    checked={watch("save_supplier") || false}
                    onCheckedChange={(checked) =>
                      setValue("save_supplier", checked)
                    }
                  />
                  <Label htmlFor="save_supplier" className="text-sm">
                    Leverancier opslaan voor toekomst
                  </Label>
                </div>
              </div>
            </>
          )}
        </FormGroup>
      </WizardStep>

      <DialogFooter className="px-0 pb-0 pt-6">
        <WizardNavigation
          finishLabel="Opslaan"
          onClose={() => onOpenChange(false)}
        />
      </DialogFooter>
    </>
  );
}
