"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Form, FormInput, FormTextarea } from "@/components/forms";
import {
  Wizard,
  WizardStep,
  WizardNavigation,
  WizardProgress,
} from "@/components/ui";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useWizardErrorNavigation } from "@/hooks/useWizardErrorNavigation";
import type { FieldToStepMap } from "@/types/wizard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const onboardingSchema = z.object({
  companyName: z.string().min(1, "Bedrijfsnaam is verplicht"),
  fullName: z.string().min(1, "Volledige naam is verplicht"),
  phone: z.string().min(1, "Telefoonnummer is verplicht"),
  address: z.string().min(1, "Adres is verplicht"),
  city: z.string().min(1, "Plaats is verplicht"),
  postalCode: z.string().min(1, "Postcode is verplicht"),
  kvkNumber: z.string().min(1, "KVK nummer is verplicht"),
  btwNumber: z.string().optional(),
  website: z.string().optional(),
  description: z.string().min(1, "Beschrijving is verplicht"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Mapping van velden naar wizard stappen
const fieldToStepMap: FieldToStepMap = {
  // Stap 1
  companyName: 1,
  fullName: 1,
  phone: 1,
  website: 1,
  description: 1,
  // Stap 2
  address: 2,
  postalCode: 2,
  city: 2,
  // Stap 3
  kvkNumber: 3,
  btwNumber: 3,
};

function OnboardingFormContent({
  isCompletingOnboarding,
}: {
  isCompletingOnboarding: boolean;
}) {
  return (
    <>
      <WizardProgress />
      <div className="flex-1 space-y-6">
        <WizardStep step={1}>
          <Card className="border-none shadow-none">
            <CardHeader className="px-2 pt-0 pb-4">
              <CardTitle>Stap 1: Bedrijfsinformatie</CardTitle>
              <CardDescription>
                Vertel ons iets over uw uitvaartonderneming en uzelf
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 py-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="companyName"
                  label="Bedrijfsnaam"
                  placeholder="Uitvaartonderneming De Vrede"
                  validation={{
                    required: "Bedrijfsnaam is verplicht",
                    minLength: {
                      value: 2,
                      message:
                        "Bedrijfsnaam moet minimaal 2 karakters bevatten",
                    },
                  }}
                />

                <FormInput
                  name="fullName"
                  label="Uw volledige naam"
                  placeholder="Jan de Vries"
                  validation={{
                    required: "Volledige naam is verplicht",
                    minLength: {
                      value: 2,
                      message:
                        "Volledige naam moet minimaal 2 karakters bevatten",
                    },
                  }}
                />

                <FormInput
                  name="phone"
                  label="Telefoonnummer"
                  type="tel"
                  placeholder="06-12345678"
                  validation={{
                    required: "Telefoonnummer is verplicht",
                    minLength: {
                      value: 10,
                      message:
                        "Telefoonnummer moet minimaal 10 cijfers bevatten",
                    },
                  }}
                />

                <FormInput
                  name="website"
                  label="Website (optioneel)"
                  type="url"
                  placeholder="https://www.uitvaartonderneming.nl"
                />
              </div>

              <div className="mt-4">
                <FormTextarea
                  name="description"
                  label="Korte beschrijving van uw bedrijf"
                  placeholder="Vertel iets over uw uitvaartonderneming, specialisaties, en werkgebied..."
                  rows={8}
                  validation={{
                    required: "Beschrijving is verplicht",
                    minLength: {
                      value: 10,
                      message:
                        "Beschrijving moet minimaal 10 karakters bevatten",
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </WizardStep>

        <WizardStep step={2}>
          <Card className="border-none shadow-none">
            <CardHeader className="px-2 pt-0 pb-4">
              <CardTitle>Stap 2: Adresgegevens</CardTitle>
              <CardDescription>
                Waar is uw uitvaartonderneming gevestigd?
              </CardDescription>
            </CardHeader>

            <CardContent className="px-2 py-0">
              <div className="space-y-4">
                <FormInput
                  name="address"
                  label="Straat en huisnummer"
                  placeholder="Hoofdstraat 123"
                  validation={{
                    required: "Adres is verplicht",
                    minLength: {
                      value: 5,
                      message: "Adres moet minimaal 5 karakters bevatten",
                    },
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    name="postalCode"
                    label="Postcode"
                    placeholder="1234 AB"
                    validation={{
                      required: "Postcode is verplicht",
                      minLength: {
                        value: 4,
                        message: "Postcode moet minimaal 4 karakters bevatten",
                      },
                    }}
                  />

                  <FormInput
                    name="city"
                    label="Plaats"
                    placeholder="Amsterdam"
                    validation={{
                      required: "Plaats is verplicht",
                      minLength: {
                        value: 2,
                        message: "Plaats moet minimaal 2 karakters bevatten",
                      },
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </WizardStep>

        <WizardStep step={3}>
          <Card className="border-none shadow-none">
            <CardHeader className="px-2 pt-0 pb-4">
              <CardTitle>Stap 3: Bedrijfsgegevens</CardTitle>
              <CardDescription>
                Tot slot hebben we nog enkele officiële gegevens nodig.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 py-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="kvkNumber"
                  label="KVK nummer"
                  placeholder="12345678"
                  validation={{
                    required: "KVK nummer is verplicht",
                    minLength: {
                      value: 8,
                      message: "KVK nummer moet minimaal 8 cijfers bevatten",
                    },
                  }}
                />

                <FormInput
                  name="btwNumber"
                  label="BTW nummer (optioneel)"
                  placeholder="NL123456789B01"
                />
              </div>
            </CardContent>
          </Card>
        </WizardStep>
      </div>

      <div className="mt-auto pt-6">
        <WizardNavigation
          finishLabel={
            isCompletingOnboarding
              ? "Gegevens opslaan..."
              : "Onboarding voltooien"
          }
          isNextDisabled={isCompletingOnboarding}
        />
      </div>
    </>
  );
}

export function OnboardingForm() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { completeOnboarding, isCompletingOnboarding } = useOnboarding();

  const onSubmit = async (data: any) => {
    setError("");

    try {
      await completeOnboarding(data as OnboardingFormData);
      router.push("/dashboard");
    } catch (error) {
      setError(
        "Er is een fout opgetreden bij het opslaan van uw gegevens. Probeer het opnieuw."
      );
    }
  };

  return (
    <Wizard totalSteps={3} className="h-full flex flex-col">
      <OnboardingFormWithErrorHandler
        onSubmit={onSubmit}
        error={error}
        isCompletingOnboarding={isCompletingOnboarding}
      />
    </Wizard>
  );
}

function OnboardingFormWithErrorHandler({
  onSubmit,
  error,
  isCompletingOnboarding,
}: {
  onSubmit: (data: any) => Promise<void>;
  error: string;
  isCompletingOnboarding: boolean;
}) {
  const handleError = useWizardErrorNavigation(fieldToStepMap);

  return (
    <Form
      onSubmit={onSubmit}
      onError={handleError}
      schema={onboardingSchema}
      className="flex flex-col flex-1 gap-0"
      serverErrors={error}
    >
      <OnboardingFormContent isCompletingOnboarding={isCompletingOnboarding} />
    </Form>
  );
}
