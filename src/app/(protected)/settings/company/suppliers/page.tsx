"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSuppliers } from "@/hooks/useSuppliers";
import { GenericCard } from "@/components/ui/GenericCard";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { SupplierDeleteForm } from "@/components/forms/SupplierDeleteForm";
import { Button } from "@/components/ui/Button";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import {
  RiAddLine,
  RiPhoneLine,
  RiMailLine,
  RiGlobalLine,
} from "@remixicon/react";
import type { Database } from "@/types/database";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];

export default function SuppliersSettingsPage() {
  const { suppliers, isLoading, refetch } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Filter suppliers based on search query
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;

    const query = searchQuery.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        supplier.contact_person?.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query) ||
        supplier.type?.toLowerCase().includes(query)
    );
  }, [suppliers, searchQuery]);

  const formatAddress = (supplier: Supplier) => {
    const parts = [
      supplier.address,
      supplier.postal_code && supplier.city
        ? `${supplier.postal_code} ${supplier.city}`
        : supplier.city || supplier.postal_code,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "Geen adres opgegeven";
  };

  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "new-supplier",
        label: "Nieuwe leverancier",
        icon: <RiAddLine className="h-4 w-4" />,
        onClick: () => {
          setIsDialogOpen(true);
        },
      },
    ],
    []
  );

  const renderSupplierCard = (supplier: Supplier) => {
    const supplierContent = (
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">{formatAddress(supplier)}</div>

          {supplier.phone_number && (
            <div className="text-sm flex flex-row gap-1 items-center">
              <RiPhoneLine className="h-4 w-4" />
              <a
                href={`tel:${supplier.phone_number}`}
                className="text-blue-600 hover:underline"
              >
                {supplier.phone_number}
              </a>
            </div>
          )}

          <div className="flex flex-row gap-4 items-center">
            {supplier.email && (
              <div className="text-sm flex flex-row gap-1 items-center">
                <RiMailLine className="h-4 w-4" />
                <a
                  href={`mailto:${supplier.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {supplier.email}
                </a>
              </div>
            )}
            {supplier.website && (
              <div className="text-sm flex flex-row gap-1 items-center">
                <RiGlobalLine className="h-4 w-4" />
                <a
                  href={supplier.website}
                  className="text-blue-600 hover:underline"
                >
                  {supplier.website}
                </a>
              </div>
            )}
          </div>

          {supplier.type && (
            <div className="text-sm text-gray-500">Type: {supplier.type}</div>
          )}
        </div>
      </div>
    );

    return (
      <GenericCard
        key={supplier.id}
        title={supplier.name}
        content={supplierContent}
        actions={
          <div className="flex gap-2">
            <SupplierForm
              supplier={supplier}
              mode="edit"
              withDialog
              onSuccess={refetch}
            />
            <SupplierDeleteForm
              supplier={supplier}
              withDialog
              onSuccess={refetch}
            />
          </div>
        }
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with search and actions */}
      <div className="flex flex-col gap-4">
        {/* Smart Search Bar */}
        <SmartSearchBar
          placeholder="Zoek leveranciers..."
          actions={searchActions()}
          searchContext={{
            entityTypes: ["cost"],
          }}
          onResultsChange={(results) =>
            setSearchQuery(results.map((result) => result.entity_id).join(", "))
          }
        />
      </div>

      {/* Suppliers list */}
      <div className="space-y-4">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? (
              <div>
                <p>Geen leveranciers gevonden voor {searchQuery}</p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Alle leveranciers tonen
                </Button>
              </div>
            ) : (
              <div>
                <p>Nog geen leveranciers toegevoegd</p>
                <SupplierForm onSuccess={refetch} />
              </div>
            )}
          </div>
        ) : (
          filteredSuppliers.map(renderSupplierCard)
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe leverancier</DialogTitle>
          </DialogHeader>
          <SupplierForm onSuccess={refetch} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
