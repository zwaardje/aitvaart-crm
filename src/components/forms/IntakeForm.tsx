"use client";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Form, FormInput, FormSelect } from "@/components/forms";
import {
  Wizard,
  WizardStep,
  WizardNavigation,
  WizardProgress,
} from "@/components/ui/Wizard";
import { DialogFooter } from "@/components/ui";
import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  useCurrentUserOrganization,
  useOrganizationMembers,
} from "@/hooks/useOrganizations";
import type { OrganizationMember } from "@/types/multi-user";
import { intakeSchemas, IntakeFormData } from "@/lib/validation";
import { FormGroup } from "./FormGroup";
import { FUNERAL_STATUS_OPTIONS } from "@/constants/funeral-status";
import { Group } from "@/components/ui/Group";
import { MARITAL_STATUS_OPTIONS } from "@/constants/form-options";

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
          preferred_name: payload.client.preferred_name || "",
          last_name: payload.client.last_name || "",
          first_names: payload.client.first_names,
          street: payload.client.street,
          house_number: payload.client.house_number,
          house_number_addition: payload.client.house_number_addition,
          postal_code: payload.client.postal_code,
          city: payload.client.city,
          phone_number: payload.client.phone_number,
          email: payload.client.email,
          entrepreneur_id: user.id,
          organization_id: organizationId,
        })
        .select("id")
        .single();
      if (cErr) throw cErr;

      const { data: funeral, error: fErr } = await supabase
        .from("funerals")
        .insert({
          deceased_id: deceased.id,
          client_id: client.id,
          entrepreneur_id: user.id,
          status: payload.funeral?.status ?? "planning",
          location: payload.funeral?.location ?? null,
          signing_date: payload.funeral?.signing_date ?? null,
          funeral_director: payload.funeral?.funeral_director ?? null,
          organization_id: organizationId,
        })
        .select("id")
        .single();
      if (fErr) throw fErr;

      // Create funeral contact to link client to funeral
      // This ensures the opdrachtgever is properly linked as a contact
      const { error: fcErr } = await supabase.from("funeral_contacts").insert({
        funeral_id: funeral.id,
        client_id: client.id,
        entrepreneur_id: user.id,
        organization_id: organizationId,
        is_primary: true,
        relation: "Opdrachtgever",
      });

      // Ignore unique constraint violation (contact already exists)
      if (fcErr && fcErr.code !== "23505") {
        throw fcErr;
      }
    },
  });

  return (
    <Form
      id="intake-form"
      schema={intakeSchemas.form}
      onSubmit={(values: IntakeFormData) => createAllMutation.mutate(values)}
    >
      <IntakeFormWizard
        funeralDirectorOptions={funeralDirectorOptions}
        organizationMembersLoading={organizationMembersLoading}
      />
    </Form>
  );
}

function IntakeFormWizard({
  funeralDirectorOptions,
  organizationMembersLoading,
}: {
  funeralDirectorOptions: { value: string; label: string }[];
  organizationMembersLoading: boolean;
}) {
  const { watch } = useFormContext();
  const status = watch("funeral.status");

  const totalSteps = useMemo(() => {
    return status === "planning" ? 3 : 4;
  }, [status]);

  return (
    <Wizard totalSteps={totalSteps}>
      <WizardProgress />
      <WizardStep step={1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup title="Gegevens van de overledene">
            <Group direction="column">
              <FormInput name="deceased.preferred_name" label="Roepnaam" />
              <FormInput name="deceased.first_names" label="Voornamen" />
              <FormInput name="deceased.last_name" label="Achternaam" />
            </Group>

            <Group>
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
            </Group>
            <Group>
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
              <FormSelect
                className="flex-1"
                name="deceased.marital_status"
                label="Burgerlijke staat"
                options={MARITAL_STATUS_OPTIONS}
              />
            </Group>
            <Group>
              <FormSelect
                className="flex-1"
                name="funeral.status"
                label="Status"
                options={FUNERAL_STATUS_OPTIONS}
              />
              <FormInput
                className="flex-1"
                name="deceased.social_security_number"
                label="BSN"
              />
            </Group>
          </FormGroup>
        </div>
      </WizardStep>

      <WizardStep step={2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup title="Adresgegevens">
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
          </FormGroup>
        </div>
      </WizardStep>

      <WizardStep step={3}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup title="Opdrachtgever">
            <Group>
              <FormInput
                className="flex-1"
                name="client.preferred_name"
                label="Roepnaam"
              />
              <FormInput
                className="flex-1"
                name="client.first_names"
                label="Voornamen"
              />

              <FormInput
                name="client.last_name"
                label="Achternaam"
                className="flex-1"
              />
            </Group>
            <Group>
              <FormInput
                className="flex-1"
                name="client.street"
                label="Straat"
              />
              <FormInput
                className="flex-1"
                name="client.house_number"
                label="Huisnummer"
              />
              <FormInput
                className="flex-1"
                name="client.house_number_addition"
                label="Toevoeging"
              />
            </Group>
            <Group>
              <FormInput
                className="flex-1"
                name="client.postal_code"
                label="Postcode"
              />
              <FormInput className="flex-1" name="client.city" label="Plaats" />
            </Group>
            <Group>
              <FormInput
                className="flex-1"
                name="client.phone_number"
                label="Telefoonnummer"
              />
              <FormInput
                className="flex-1"
                name="client.email"
                label="E-mail"
                type="email"
                placeholder="naam@voorbeeld.nl"
              />
            </Group>
          </FormGroup>
        </div>
      </WizardStep>

      {status !== "planning" && (
        <WizardStep step={4}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup title="Uitvaartdetails">
              <Group>
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
              </Group>
              <Group>
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
              </Group>
              <Group>
                <FormInput
                  className="flex-1"
                  name="deceased.coffin_registration_number"
                  label="Kistregistratienummer"
                />
              </Group>
            </FormGroup>
          </div>
        </WizardStep>
      )}

      <DialogFooter className="px-0 pb-0 pt-6">
        <WizardNavigation finishLabel="Opslaan" onClose={() => {}} />
      </DialogFooter>
    </Wizard>
  );
}
