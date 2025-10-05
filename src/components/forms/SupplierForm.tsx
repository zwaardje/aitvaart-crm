"use client";

import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { SubmitButton } from "./SubmitButton";
import { schemas, SupplierFormData } from "@/lib/validation";
import { useSuppliersForCosts } from "@/hooks";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiAddLine } from "@remixicon/react";

interface SupplierFormProps {
  withDialog?: boolean;
  onSuccess?: () => void;
}

export function SupplierForm({
  withDialog = false,
  onSuccess,
}: SupplierFormProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  const { createSupplier, refetch } = useSuppliersForCosts();

  const handleCreateSupplier = async (data: SupplierFormData) => {
    try {
      await createSupplier(data);
      await refetch();
      if (withDialog) {
        setIsOpen(false);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  };

  const formContent = (
    <Form
      schema={schemas.supplier.create}
      onSubmit={handleCreateSupplier}
      defaultValues={{
        name: "",
        contact_person: "",
        phone_number: "",
        email: "",
        address: "",
        postal_code: "",
        city: "",
        type: "",
        notes: "",
      }}
    >
      <div className="space-y-4">
        <FormInput
          name="name"
          label={t("suppliers.name")}
          placeholder={t("suppliers.namePlaceholder")}
          required
        />

        <FormInput
          name="contact_person"
          label={t("suppliers.contactPerson")}
          placeholder={t("suppliers.contactPersonPlaceholder")}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="phone_number"
            label={t("suppliers.phoneNumber")}
            placeholder={t("suppliers.phoneNumberPlaceholder")}
          />
          <FormInput
            name="email"
            label={t("suppliers.email")}
            type="email"
            placeholder={t("suppliers.emailPlaceholder")}
          />
        </div>

        <FormInput
          name="address"
          label={t("suppliers.address")}
          placeholder={t("suppliers.addressPlaceholder")}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="postal_code"
            label={t("suppliers.postalCode")}
            placeholder={t("suppliers.postalCodePlaceholder")}
          />
          <FormInput
            name="city"
            label={t("suppliers.city")}
            placeholder={t("suppliers.cityPlaceholder")}
          />
        </div>

        <FormInput
          name="type"
          label={t("suppliers.type")}
          placeholder={t("suppliers.typePlaceholder")}
        />

        <FormTextarea
          name="notes"
          label={t("suppliers.notes")}
          placeholder={t("suppliers.notesPlaceholder")}
          rows={3}
        />

        {withDialog && (
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline">Annuleren</Button>
            </DialogClose>
            <SubmitButton>{t("suppliers.addSupplier")}</SubmitButton>
          </DialogFooter>
        )}
        {!withDialog && (
          <div className="flex justify-end gap-2 pt-4">
            <SubmitButton>{t("suppliers.addSupplier")}</SubmitButton>
          </div>
        )}
      </div>
    </Form>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <RiAddLine className="h-4 w-4 mr-2" />
            {t("costs.addNewSupplier")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("costs.addNewSupplier")}</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
