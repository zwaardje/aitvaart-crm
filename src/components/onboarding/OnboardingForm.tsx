"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Form,
  FormInput,
  FormTextarea,
  FormSelect,
  SubmitButton,
} from "@/components/forms";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Wizard,
  WizardStep,
  WizardNavigation,
  WizardProgress,
} from "@/components/ui";
import { useOnboarding } from "@/hooks/useOnboarding";

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

export function OnboardingForm() {
  const [error, setError] = useState("");
  const router = useRouter();
  const { completeOnboarding, isCompletingOnboarding } = useOnboarding();
  const t = useTranslations();

  const onSubmit = async (data: any) => {
    setError("");

    try {
      await completeOnboarding(data as OnboardingFormData);
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      setError(
        "Er is een fout opgetreden bij het opslaan van uw gegevens. Probeer het opnieuw."
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("Welkom bij uw uitvaart CRM") || "Welkom bij uw uitvaart CRM"}
        </h1>
        <p className="text-gray-600">
          {t(
            "Om u optimaal van dienst te kunnen zijn, hebben we enkele gegevens van uw uitvaartonderneming nodig. Deze informatie is cruciaal voor het correct functioneren van het systeem."
          ) ||
            "Om u optimaal van dienst te kunnen zijn, hebben we enkele gegevens van uw uitvaartonderneming nodig. Deze informatie is cruciaal voor het correct functioneren van het systeem."}
        </p>
      </div>

      <Wizard totalSteps={3}>
        <WizardProgress />

        <Form
          onSubmit={onSubmit}
          schema={onboardingSchema}
          className="space-y-6"
        >
          {/* Stap 1: Bedrijfsinformatie */}
          <WizardStep step={1}>
            <div className="rounded-lg border bg-card text-card-foreground p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("Stap 1: Bedrijfsinformatie") ||
                  "Stap 1: Bedrijfsinformatie"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("Vertel ons iets over uw uitvaartonderneming en uzelf.") ||
                  "Vertel ons iets over uw uitvaartonderneming en uzelf."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="companyName"
                  label={t("Bedrijfsnaam")}
                  placeholder={t("Uitvaartonderneming De Vrede")}
                  validation={{
                    required: t("Bedrijfsnaam is verplicht"),
                    minLength: {
                      value: 2,
                      message: t(
                        "Bedrijfsnaam moet minimaal 2 karakters bevatten"
                      ),
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
                  rows={3}
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
            </div>
          </WizardStep>

          {/* Stap 2: Adresgegevens */}
          <WizardStep step={2}>
            <div className="rounded-lg border bg-card text-card-foreground p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Stap 2: Adresgegevens
              </h2>
              <p className="text-muted-foreground mb-6">
                Waar is uw uitvaartonderneming gevestigd?
              </p>

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
            </div>
          </WizardStep>

          {/* Stap 3: Bedrijfsgegevens */}
          <WizardStep step={3}>
            <div className="rounded-lg border bg-card text-card-foreground p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Stap 3: Bedrijfsgegevens
              </h2>
              <p className="text-muted-foreground mb-6">
                Tot slot hebben we nog enkele officiële gegevens nodig.
              </p>

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
            </div>

            <Alert className="mt-6">
              <AlertTitle>Belangrijke informatie</AlertTitle>
              <AlertDescription>
                Deze gegevens zijn noodzakelijk voor het correct functioneren
                van uw CRM systeem. U kunt deze informatie later nog aanpassen
                in uw profielinstellingen.
              </AlertDescription>
            </Alert>
          </WizardStep>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Fout bij opslaan</AlertTitle>
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <WizardNavigation
            finishLabel={
              isCompletingOnboarding
                ? t("Gegevens opslaan...")
                : t("Onboarding voltooien")
            }
            isNextDisabled={isCompletingOnboarding}
          />
        </Form>
      </Wizard>
    </div>
  );
}
