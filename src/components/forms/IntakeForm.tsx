"use client";

import { useTranslations } from "next-intl";
import { Form, FormInput, FormSelect } from "@/components/forms";
import {
  Wizard,
  WizardStep,
  WizardNavigation,
  WizardProgress,
  useWizard,
} from "@/components/ui/Wizard";
import { DialogFooter, Button } from "@/components/ui";
import { useFormContext } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function IntakeForm() {
  const t = useTranslations("intake");

  const createAllMutation = useMutation({
    mutationFn: async (payload: {
      deceased: any;
      client: any;
      funeral: any;
    }) => {
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session");

      const { data: deceased, error: dErr } = await supabase
        .from("deceased")
        .insert({ ...payload.deceased, entrepreneur_id: user.id })
        .select("id")
        .single();
      if (dErr) throw dErr;

      const { data: client, error: cErr } = await supabase
        .from("clients")
        .insert({ ...payload.client, entrepreneur_id: user.id })
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
      });
      if (fErr) throw fErr;
    },
  });

  function ReviewSummary() {
    const { getValues } = useFormContext();
    const { goToStep } = useWizard();
    const v = getValues();

    const Item = ({ label, value }: { label: string; value: any }) => (
      <div className="flex items-start justify-between gap-3 py-1 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-right break-words max-w-[60%]">
          {value ?? "-"}
        </span>
      </div>
    );

    return (
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("sections.deceased.personal", { default: "Persoonsgegevens" })}
            </h3>
            <Button variant="link" type="button" onClick={() => goToStep(1)}>
              {t("actions.edit", { default: "Bewerken" })}
            </Button>
          </div>
          <div className="rounded-md border p-4">
            <Item
              label={t("deceased.first_names")}
              value={v?.deceased?.first_names}
            />
            <Item
              label={t("deceased.preferred_name")}
              value={v?.deceased?.preferred_name}
            />
            <Item
              label={t("deceased.last_name")}
              value={v?.deceased?.last_name}
            />
            <Item label={t("deceased.gender")} value={v?.deceased?.gender} />
            <Item
              label={t("deceased.date_of_birth")}
              value={v?.deceased?.date_of_birth}
            />
            <Item
              label={t("deceased.place_of_birth")}
              value={v?.deceased?.place_of_birth}
            />
            <Item
              label={t("deceased.social_security_number")}
              value={v?.deceased?.social_security_number}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("steps.address_contact.title", { default: "Adres & Contact" })}
            </h3>
            <Button variant="link" type="button" onClick={() => goToStep(2)}>
              {t("actions.edit", { default: "Bewerken" })}
            </Button>
          </div>
          <div className="rounded-md border p-4">
            <Item
              label={t("deceased.address.street")}
              value={v?.deceased?.street}
            />
            <Item
              label={t("deceased.address.house_number")}
              value={v?.deceased?.house_number}
            />
            <Item
              label={t("deceased.address.house_number_addition")}
              value={v?.deceased?.house_number_addition}
            />
            <Item
              label={t("deceased.address.postal_code")}
              value={v?.deceased?.postal_code}
            />
            <Item
              label={t("deceased.address.city")}
              value={v?.deceased?.city}
            />
            <Item
              label={t("client.preferred_name")}
              value={v?.client?.preferred_name}
            />
            <Item label={t("client.last_name")} value={v?.client?.last_name} />
            <Item
              label={t("client.phone_number")}
              value={v?.client?.phone_number}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("steps.funeral.title", { default: "Uitvaartdetails" })}
            </h3>
            <Button variant="link" type="button" onClick={() => goToStep(3)}>
              {t("actions.edit", { default: "Bewerken" })}
            </Button>
          </div>
          <div className="rounded-md border p-4">
            <Item label={t("funeral.location")} value={v?.funeral?.location} />
            <Item
              label={t("funeral.signing_date")}
              value={v?.funeral?.signing_date}
            />
            <Item
              label={t("funeral.funeral_director")}
              value={v?.funeral?.funeral_director}
            />
            <Item
              label={t("deceased.date_of_death")}
              value={v?.deceased?.date_of_death}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form
      id="intake-form"
      onSubmit={(values: any) =>
        createAllMutation.mutate({
          deceased: values.deceased,
          client: values.client,
          funeral: values.funeral,
        })
      }
    >
      <Wizard totalSteps={4}>
        <WizardProgress />

        <WizardStep step={1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-sm font-semibold text-muted-foreground">
              {t("steps.deceased.title", { default: "Overledene" })}
            </h3>
            <p className="col-span-full text-sm text-muted-foreground">
              {t("steps.deceased.description", {
                default: "Kerngegevens van de overledene",
              })}
            </p>
            <FormInput
              name="deceased.first_names"
              label={t("deceased.first_names")}
            />
            <FormInput
              name="deceased.preferred_name"
              label={t("deceased.preferred_name")}
            />
            <FormInput
              name="deceased.last_name"
              label={t("deceased.last_name")}
            />
            <FormSelect
              name="deceased.gender"
              label={t("deceased.gender")}
              options={[
                {
                  value: "male",
                  label: t("common.gender.male", { default: "Man" }),
                },
                {
                  value: "female",
                  label: t("common.gender.female", { default: "Vrouw" }),
                },
                {
                  value: "other",
                  label: t("common.gender.other", { default: "Anders" }),
                },
              ]}
            />
            <FormInput
              name="deceased.date_of_birth"
              type="date"
              label={t("deceased.date_of_birth")}
            />
            <FormInput
              name="deceased.place_of_birth"
              label={t("deceased.place_of_birth")}
            />
            <FormInput
              name="deceased.social_security_number"
              label={t("deceased.social_security_number")}
            />
            <h3 className="col-span-full mt-4 text-sm font-semibold text-muted-foreground">
              {t("sections.deceased.other", { default: "Overige" })}
            </h3>
            <FormInput
              name="deceased.coffin_registration_number"
              label={t("deceased.coffin_registration_number")}
            />
          </div>
        </WizardStep>

        <WizardStep step={2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-sm font-semibold text-muted-foreground">
              {t("steps.address_contact.title", { default: "Adres & Contact" })}
            </h3>
            <p className="col-span-full text-sm text-muted-foreground">
              {t("steps.address_contact.description", {
                default: "Adres van de overledene en contactpersoon",
              })}
            </p>
            <FormInput
              name="deceased.street"
              label={t("deceased.address.street")}
            />
            <FormInput
              name="deceased.house_number"
              label={t("deceased.address.house_number")}
            />
            <FormInput
              name="deceased.house_number_addition"
              label={t("deceased.address.house_number_addition")}
            />
            <FormInput
              name="deceased.postal_code"
              label={t("deceased.address.postal_code")}
            />
            <FormInput
              name="deceased.city"
              label={t("deceased.address.city")}
            />

            <h3 className="col-span-full mt-4 text-sm font-semibold text-muted-foreground">
              {t("sections.client.contact", { default: "Contactpersoon" })}
            </h3>
            <FormInput
              name="client.preferred_name"
              label={t("client.preferred_name")}
            />
            <FormInput name="client.last_name" label={t("client.last_name")} />
            <FormInput
              name="client.phone_number"
              label={t("client.phone_number")}
            />
          </div>
        </WizardStep>

        <WizardStep step={3}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full text-sm font-semibold text-muted-foreground">
              {t("steps.funeral.title", { default: "Uitvaartdetails" })}
            </h3>
            <p className="col-span-full text-sm text-muted-foreground">
              {t("steps.funeral.description", {
                default: "Locatie, datum en uitvaartverzorger",
              })}
            </p>
            <FormInput name="funeral.location" label={t("funeral.location")} />
            <FormInput
              name="funeral.signing_date"
              type="date"
              label={t("funeral.signing_date")}
            />
            <FormInput
              name="funeral.funeral_director"
              label={t("funeral.funeral_director")}
            />
            <FormInput
              name="deceased.date_of_death"
              type="date"
              label={t("deceased.date_of_death")}
            />
          </div>
        </WizardStep>

        <WizardStep step={4}>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("steps.review.title", { default: "Controleren & Opslaan" })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("steps.review.description", {
                default:
                  "Controleer de gegevens en sla op. Je kunt per sectie nog bewerken.",
              })}
            </p>
            <ReviewSummary />
          </div>
        </WizardStep>

        <DialogFooter className="px-0 pb-0 pt-6">
          <WizardNavigation
            formId="intake-form"
            finishLabel={t("actions.finish", { default: "Opslaan" })}
          />
        </DialogFooter>
      </Wizard>
    </Form>
  );
}
