"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "./Form";
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
import { schemas, CostWizardFormData } from "@/lib/validation";
import { usePricelist } from "@/hooks/usePricelist";
import { useCreateCost, useCosts } from "@/hooks/useCosts";
import { EmptyState } from "@/components/ui/EmptyState";
import { GenericCard } from "@/components/ui/GenericCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { calculateUnitPriceExcl } from "@/lib/price-utils";
import {
  RiSearchLine,
  RiAddLine,
  RiFilterLine,
  RiDeleteBinLine,
  RiMoneyEuroBoxLine,
} from "@remixicon/react";
import type { Database } from "@/types/database";

const costWizardFieldToStepMap: FieldToStepMap = {
  selectedItems: 1,
};

type PricelistItemWithSupplier =
  Database["public"]["Tables"]["pricelist_items"]["Row"] & {
    supplier: Database["public"]["Tables"]["suppliers"]["Row"] | null;
  };

interface CostFormWizardProps {
  funeralId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onRequestAddItem?: () => void;
}

export function CostFormWizard({
  funeralId,
  open,
  onOpenChange,
  onSuccess,
  onRequestAddItem,
}: CostFormWizardProps) {
  const { items, isLoading, isPending } = usePricelist();
  const { createCostWithDefaults } = useCreateCost();
  const { costs, updateCost } = useCosts(funeralId);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = async (values: CostWizardFormData) => {
    try {
      // Maak funeral_suppliers records voor elk geselecteerd item
      const itemsWithDetails = items.filter((item) =>
        values.selectedItems.some((si) => si.pricelistItemId === item.id)
      );

      for (const selectedItem of values.selectedItems) {
        const item = itemsWithDetails.find(
          (i) => i.id === selectedItem.pricelistItemId
        );
        if (!item || !item.supplier_id) continue;

        const unitPriceExcl = calculateUnitPriceExcl(
          item.price_incl,
          item.vat_rate
        );

        // Check if this item already exists in costs
        const existingCost = costs.find(
          (cost) =>
            cost.product_name === item.title &&
            cost.supplier_id === item.supplier_id
        );

        if (existingCost) {
          // Update quantity instead of creating new record
          await updateCost(existingCost.id, {
            quantity: (existingCost.quantity || 1) + selectedItem.quantity,
          });
        } else {
          // Create new cost record
          await createCostWithDefaults({
            funeral_id: funeralId,
            supplier_id: item.supplier_id,
            product_name: item.title,
            quantity: selectedItem.quantity,
            unit_price: unitPriceExcl,
            notes: item.description || null,
          });
        }
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating costs:", error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kosten toevoegen</DialogTitle>
        </DialogHeader>
        <Form
          schema={schemas.costWizard.form}
          onSubmit={handleSubmit}
          defaultValues={{
            selectedItems: [],
          }}
        >
          <CostFormWizardWrapper
            items={items as PricelistItemWithSupplier[]}
            isLoading={isPending || isLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddItemClick={onRequestAddItem || (() => {})}
            onClose={() => onOpenChange(false)}
            existingCosts={costs}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CostFormWizardWrapper({
  items,
  isLoading,
  searchTerm,
  onSearchChange,
  onAddItemClick,
  onClose,
  existingCosts,
}: {
  items: PricelistItemWithSupplier[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddItemClick: () => void;
  onClose?: () => void;
  existingCosts: Array<{
    product_name: string;
    supplier_id: string;
  }>;
}) {
  return (
    <Wizard totalSteps={2}>
      <CostFormWizardWithErrorHandler
        items={items}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onAddItemClick={onAddItemClick}
        onClose={onClose}
        existingCosts={existingCosts}
      />
    </Wizard>
  );
}

function CostFormWizardWithErrorHandler({
  items,
  isLoading,
  searchTerm,
  onSearchChange,
  onAddItemClick,
  onClose,
  existingCosts,
}: {
  items: PricelistItemWithSupplier[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddItemClick: () => void;
  onClose?: () => void;
  existingCosts: Array<{
    product_name: string;
    supplier_id: string;
  }>;
}) {
  const handleError = useWizardErrorNavigation(costWizardFieldToStepMap);

  return (
    <WizardErrorProvider onError={handleError}>
      <CostFormWizardContent
        items={items}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onAddItemClick={onAddItemClick}
        onClose={onClose}
        existingCosts={existingCosts}
      />
    </WizardErrorProvider>
  );
}

function CostFormWizardContent({
  items,
  isLoading,
  searchTerm,
  onSearchChange,
  onAddItemClick,
  onClose,
  existingCosts,
}: {
  items: PricelistItemWithSupplier[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddItemClick: () => void;
  onClose?: () => void;
  existingCosts: Array<{
    product_name: string;
    supplier_id: string;
  }>;
}) {
  const { watch, setValue } = useFormContext<CostWizardFormData>();
  const watchedSelectedItems = watch("selectedItems");
  const selectedItems = useMemo(
    () => watchedSelectedItems || [],
    [watchedSelectedItems]
  );

  // Filter out items that already exist in costs
  const availableItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.supplier_id) return false;
      // Check if this item already exists in costs
      const exists = existingCosts.some(
        (cost) =>
          cost.product_name === item.title &&
          cost.supplier_id === item.supplier_id
      );
      return !exists;
    });
  }, [items, existingCosts]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return availableItems;
    const term = searchTerm.toLowerCase();
    return availableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.supplier?.name.toLowerCase().includes(term)
    );
  }, [availableItems, searchTerm]);

  const handleItemToggle = (itemId: string, checked: boolean) => {
    const current = selectedItems || [];
    const isCurrentlySelected = current.some(
      (si) => si.pricelistItemId === itemId
    );

    // Prevent unnecessary updates if state is already correct
    if (checked === isCurrentlySelected) {
      return;
    }

    if (checked) {
      setValue(
        "selectedItems",
        [...current, { pricelistItemId: itemId, quantity: 1 }],
        { shouldDirty: true }
      );
    } else {
      setValue(
        "selectedItems",
        current.filter((si) => si.pricelistItemId !== itemId),
        { shouldDirty: true }
      );
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const current = selectedItems || [];
    setValue(
      "selectedItems",
      current.map((si) =>
        si.pricelistItemId === itemId ? { ...si, quantity } : si
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    const current = selectedItems || [];
    setValue(
      "selectedItems",
      current.filter((si) => si.pricelistItemId !== itemId)
    );
  };

  const selectedItemsWithDetails = useMemo(() => {
    return selectedItems
      .map((si) => {
        const item = items.find((i) => i.id === si.pricelistItemId);
        return item ? { ...si, item } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [selectedItems, items]);

  return (
    <>
      <WizardProgress />
      <WizardStep step={1}>
        {isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>Loading...</p>
          </div>
        )}
        <div className="space-y-4">
          {(availableItems.length === 0 || availableItems === undefined) && !isLoading && (
            <EmptyState
              icon={<RiMoneyEuroBoxLine className="h-12 w-12" />}
              title="Geen beschikbare items"
              description={
                existingCosts.length > 0
                  ? "Alle items uit de prijslijst zijn al toegevoegd aan de kosten. Voeg nieuwe prijslijst items toe om meer opties te hebben."
                  : "Er zijn nog geen items toegevoegd om uit te kiezen. Voeg prijslijst items toe om de prijslijst te vullen."
              }
              action={{
                label: "Nieuw item toevoegen",
                onClick: onAddItemClick,
                icon: <RiAddLine className="h-4 w-4" />,
              }}
            />
          )}

          {availableItems.length > 0 && availableItems !== undefined && !isLoading && (
            <>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Zoek"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                >
                  <RiFilterLine className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={onAddItemClick}
                  className="flex items-center gap-2"
                >
                  <RiAddLine className="h-4 w-4" />
                  Nieuw item
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => {
                  const isSelected = selectedItems.some(
                    (si) => si.pricelistItemId === item.id
                  );
                  return (
                    <div
                      key={item.id}
                      className={`cursor-pointer transition-colors`}
                      onClick={(e) => {
                        // Only handle click if it's not on the checkbox
                        if (
                          e.target instanceof HTMLElement &&
                          !e.target.closest('[role="checkbox"]')
                        ) {
                          handleItemToggle(item.id, !isSelected);
                        }
                      }}
                    >
                      <GenericCard
                        title={item.title}
                        subtitle={item.supplier?.name}
                        content={item.description}
                        actions={
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              handleItemToggle(item.id, checked as boolean);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                        className="cursor-pointer"
                      />
                    </div>
                  );
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Geen items gevonden</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </WizardStep>

      <WizardStep step={2}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Overzicht</h2>

          <div className="space-y-3">
            {selectedItemsWithDetails.map(({ item, quantity }) => (
              <GenericCard
                key={item.id}
                title={item.title}
                subtitle={item.supplier?.name}
                content={item.description}
                actions={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                  </Button>
                }
                footer={
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-xs text-gray-500">Aantal</span>
                    <div className="flex items-center gap-1 border rounded w-fit">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            Math.max(0.01, quantity - 1)
                          )
                        }
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            parseFloat(e.target.value) || 0.01
                          )
                        }
                        className="w-16 h-8 text-center border-0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleQuantityChange(item.id, quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                  </div>
                }
              />
            ))}
            {selectedItemsWithDetails.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Geen items geselecteerd</p>
              </div>
            )}
          </div>
        </div>
      </WizardStep>

      <DialogFooter className="px-0 pb-0 pt-6">
        <WizardNavigation
          finishLabel="Toevoegen aan kosten ✓"
          onClose={onClose}
        />
      </DialogFooter>
    </>
  );
}
