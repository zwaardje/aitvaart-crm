"use client";
import { useMemo } from "react";
import { Form, FormInput, FormSelect } from "@/components/forms";
import { Wizard, WizardStep, WizardNavigation } from "@/components/ui/Wizard";
import { DialogFooter } from "@/components/ui";
import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  useCurrentUserOrganization,
  useOrganizationMembers,
} from "@/hooks/useOrganizations";
import type { OrganizationMember } from "@/types/multi-user";
import { intakeSchemas, IntakeFormData } from "@/lib/validation";

export function IntakeForm() {
  const { data: currentOrganization } = useCurrentUserOrganization();
  const organizationId =
    currentOrganization?.organization_id ||
    currentOrganization?.organization?.id ||
    null;
  const { data: organizationMembers, isLoading: organizationMembersLoading } =
    useOrganizationMembers(organizationId ?? "");

  const funeralDirectorOptions = useMemo(() => {
    const typedMembers = organizationMembers as
      | OrganizationMember[]
      | undefined;
    if (!typedMembers || typedMembers.length === 0) return [];

    return typedMembers
      .filter((member) => member.status === "active")
      .map((member) => {
        const name =
          member.user?.full_name?.trim() ||
          member.user?.company_name?.trim() ||
          member.role?.trim();

        return name
          ? {
              value: name,
              label: name,
            }
          : null;
      })
      .filter(
        (option): option is { value: string; label: string } => option !== null
      );
  }, [organizationMembers]);

  const createAllMutation = useMutation({
    mutationFn: async (payload: IntakeFormData) => {
      if (!organizationId) {
        throw new Error("Geen organisatiecontext gevonden");
      }

      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session");

      const { data: deceased, error: dErr } = await supabase
        .from("deceased")
        .insert({
          ...payload.deceased,
          entrepreneur_id: user.id,
          organization_id: organizationId,
        })
        .select("id")
        .single();
      if (dErr) throw dErr;

      const { data: client, error: cErr } = await supabase
        .from("clients")
        .insert({
          ...payload.client,
          entrepreneur_id: user.id,
          organization_id: organizationId,
        })
        .select("id")
        .single();
      if (cErr) throw cErr;

      const { error: fErr } = await supabase.from("funerals").insert({
        deceased_id: deceased.id,
        client_id: client.id,
        entrepreneur_id: user.id,
        location: payload.funeral.location ?? null,
        signing_date: payload.funeral.signing_date ?? null,
        funeral_director: payload.funeral.funeral_director ?? null,
        organization_id: organizationId,
      });
      if (fErr) throw fErr;
    },
  });

  return (
    <Form
      id="intake-form"
      canWatchErrors={true}
      schema={intakeSchemas.form}
      onSubmit={(values: IntakeFormData) => createAllMutation.mutate(values)}
    >
      <Wizard totalSteps={4}>
        <WizardStep step={1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-sm font-semibold text-muted-foreground">
              Gegevens van de overledene
            </h3>
            <div className="flex items-center gap-2 justify-evenly">
              <FormInput
                className="w-full"
                name="deceased.first_names"
                label="Voornamen"
              />
              <FormInput
                className="w-full"
                name="deceased.last_name"
                label="Achternaam"
              />
            </div>

            <div className="flex items-center gap-2 justify-evenly">
              <FormInput
                className="w-full"
                name="deceased.date_of_birth"
                type="date"
                label="Geboortedatum"
              />
              <FormInput
                className="w-full"
                name="deceased.place_of_birth"
                label="Geboorteplaats"
              />
            </div>
            <div className="flex items-center gap-2 justify-evenly">
              <FormSelect
                name="deceased.gender"
                label="Geslacht"
                options={[
                  {
                    value: "male",
                    label: "Man",
                  },
                  {
                    value: "female",
                    label: "Vrouw",
                  },
                  {
                    value: "other",
                    label: "Anders",
                  },
                ]}
              />
              <FormInput
                className="w-full"
                name="deceased.social_security_number"
                label="BSN"
              />
            </div>

            <FormInput
              name="deceased.coffin_registration_number"
              label="Kistregistratienummer"
            />
          </div>
        </WizardStep>

        <WizardStep step={2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-sm font-semibold text-muted-foreground">
              Adresgegevens
            </h3>

            <FormInput
              name="deceased.street"
              label="Straat"
              className="w-full"
            />
            <div className="flex items-center gap-2 justify-evenly">
              <FormInput
                name="deceased.house_number"
                label="Huisnummer"
                className="w-full"
              />
              <FormInput
                name="deceased.house_number_addition"
                label="Toevoeging"
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 justify-evenly">
              <FormInput
                name="deceased.postal_code"
                label="Postcode"
                className="w-full"
              />
              <FormInput
                name="deceased.city"
                label="Plaats"
                className="w-full"
              />
            </div>
          </div>
        </WizardStep>

        <WizardStep step={3}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-sm font-semibold text-muted-foreground">
              Contactpersoon
            </h3>

            <div className="flex items-center gap-2 justify-evenly">
              <FormInput
                name="client.preferred_name"
                label="Voornaam"
                className="w-full"
              />
              <FormInput
                name="client.last_name"
                label="Achternaam"
                className="w-full"
              />
            </div>
            <FormInput name="client.phone_number" label="Telefoonnummer" />
            <FormInput
              name="client.email"
              label="E-mail"
              type="email"
              placeholder="naam@voorbeeld.nl"
            />
          </div>
        </WizardStep>

        <WizardStep step={4}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-sm font-semibold text-muted-foreground">
              Uitvaartdetails
            </h3>
            {funeralDirectorOptions.length > 0 ? (
              <FormSelect
                name="funeral.funeral_director"
                label="Uitvaartverzorger"
                placeholder={
                  organizationMembersLoading
                    ? "Teamleden laden..."
                    : "Selecteer uitvaartverzorger"
                }
                options={funeralDirectorOptions}
              />
            ) : (
              <FormInput
                name="funeral.funeral_director"
                label="Uitvaartverzorger"
              />
            )}

            <FormInput name="funeral.location" label="Locatie" />
            <div className="flex items-center gap-2 justify-evenly">
              <FormInput
                className="w-full"
                name="deceased.date_of_death"
                type="date"
                label="Overlijdensdatum"
              />
              <FormInput
                className="w-full"
                name="funeral.signing_date"
                type="date"
                label="Datum van ondertekening"
              />
            </div>
          </div>
        </WizardStep>

        <DialogFooter className="px-0 pb-0 pt-6">
          <WizardNavigation formId="intake-form" finishLabel="Opslaan" />
        </DialogFooter>
      </Wizard>
    </Form>
  );
}
