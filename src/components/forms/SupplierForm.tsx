"use client";

import { useState } from "react";
import { Form } from "./Form";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { SubmitButton } from "./SubmitButton";
import { schemas } from "@/lib/validation";
import { useSuppliers } from "@/hooks/useSuppliers";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiAddLine, RiEditLine } from "@remixicon/react";
import type { Database } from "@/types/database";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type SupplierInsert = Database["public"]["Tables"]["suppliers"]["Insert"];
type SupplierUpdate = Database["public"]["Tables"]["suppliers"]["Update"];

interface SupplierFormProps {
  withDialog?: boolean;
  supplier?: Supplier;
  onSuccess?: () => void;
  mode?: "create" | "edit";
}

export function SupplierForm({
  withDialog = false,
  supplier,
  onSuccess,
  mode = "create",
}: SupplierFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { createSupplier, updateSupplier, isCreating, isUpdating } =
    useSuppliers();

  const handleSubmit = async (data: any) => {
    try {
      if (mode === "create") {
        await createSupplier(data);
      } else if (supplier) {
        await updateSupplier({
          id: supplier.id,
          updates: data,
        });
      }

      if (withDialog) {
        setIsOpen(false);
      }
      onSuccess?.();
      console.log(
        `Supplier ${mode === "create" ? "created" : "updated"} successfully`
      );
    } catch (error) {
      console.error(
        `Error ${mode === "create" ? "creating" : "updating"} supplier:`,
        error
      );
      throw error;
    }
  };

  const isLoading = isCreating || isUpdating;
  const title =
    mode === "create" ? "Nieuwe leverancier" : "Leverancier bewerken";
  const submitText = mode === "create" ? "Toevoegen" : "Opslaan";

  const formContent = (
    <Form
      schema={schemas.supplier.create}
      onSubmit={handleSubmit}
      defaultValues={{
        name: supplier?.name || "",
        contact_person: supplier?.contact_person || "",
        phone_number: supplier?.phone_number || "",
        email: supplier?.email || "",
        address: supplier?.address || "",
        postal_code: supplier?.postal_code || "",
        city: supplier?.city || "",
        type: supplier?.type || "",
        notes: supplier?.notes || "",
      }}
    >
      <div className="space-y-4">
        <FormInput
          name="name"
          label="Bedrijfsnaam"
          placeholder="Typ hier de bedrijfsnaam"
          required
        />

        <FormInput
          name="contact_person"
          label="Contactpersoon"
          placeholder="Naam van contactpersoon"
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="phone_number"
            label="Telefoonnummer"
            placeholder="+31 6 12345678"
          />

          <FormInput
            name="email"
            label="E-mail"
            placeholder="info@leverancier.nl"
            type="email"
          />
        </div>

        <FormInput name="address" label="Adres" placeholder="Straatnaam 123" />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="postal_code"
            label="Postcode"
            placeholder="1234 AB"
          />

          <FormInput name="city" label="Plaats" placeholder="Amsterdam" />
        </div>

        <FormInput
          name="type"
          label="Type leverancier"
          placeholder="Bijv. Uitvaartkisten, Bloemen, etc."
        />

        <FormTextarea
          name="notes"
          label="Opmerkingen"
          placeholder="Extra informatie over de leverancier"
          rows={3}
        />

        {withDialog && (
          <DialogFooter className="mt-2 flex flex-row justify-between">
            <DialogClose asChild>
              <Button variant="outline">Annuleren</Button>
            </DialogClose>
            <SubmitButton isLoading={isLoading}>{submitText}</SubmitButton>
          </DialogFooter>
        )}
        {!withDialog && (
          <div className="flex justify-end gap-2 pt-4">
            <SubmitButton isLoading={isLoading}>{submitText}</SubmitButton>
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
            {mode === "create" ? (
              <>
                <RiAddLine className="h-4 w-4 mr-2" />
                Toevoegen
              </>
            ) : (
              <RiEditLine className="h-4 w-4" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
