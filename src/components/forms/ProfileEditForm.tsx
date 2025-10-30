"use client";

import * as React from "react";
import { useState } from "react";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/forms/Form";
import { FormInput } from "./FormInput";
import { SubmitButton } from "./SubmitButton";
import { schemas } from "@/lib/validation";
import { useAuth } from "@/hooks/useAuth";
import { RiEditLine } from "@remixicon/react";
import type { Profile } from "@/types/database";

interface ProfileEditFormProps {
  profile: Profile;
  onSuccess?: () => void;
}

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { updateProfile, isUpdatingProfile } = useAuth();

  const handleSubmit = async (data: any) => {
    try {
      updateProfile(data, {
        onSuccess: () => {
          setIsOpen(false);
          onSuccess?.();
          console.log("Profiel succesvol bijgewerkt");
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const formContent = (
    <Form
      schema={schemas.profile.update}
      onSubmit={handleSubmit}
      defaultValues={{
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      }}
    >
      <div className="space-y-4">
        <FormInput
          name="full_name"
          label="Volledige naam"
          placeholder="Typ hier uw volledige naam"
          required
        />

        <FormInput
          name="phone"
          label="Telefoonnummer"
          placeholder="+31 6 12345678"
        />

        <FormInput
          name="email"
          label="E-mail"
          placeholder="gebruiker@example.com"
          type="email"
        />

        <DialogFooter className="mt-2 flex flex-row justify-between">
          <DialogClose asChild>
            <Button variant="outline">Annuleren</Button>
          </DialogClose>
          <SubmitButton isLoading={isUpdatingProfile}>Opslaan</SubmitButton>
        </DialogFooter>
      </div>
    </Form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RiEditLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profiel bewerken</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
