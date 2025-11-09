"use client";

import { useState } from "react";
import { z } from "zod";
import { Link } from "@/components/ui";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Form, FormInput, SubmitButton } from "@/components/forms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const signUpSchema = z
  .object({
    email: z.string().email("Voer een geldig email adres in"),
    password: z
      .string()
      .min(6, "Wachtwoord moet minimaal 6 karakters bevatten"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowser();

      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        // Provide more user-friendly and consistent error messages
        if (
          authError.message.includes("already registered") ||
          authError.message.includes("already exists") ||
          authError.message.includes("User already registered")
        ) {
          setError(
            "Dit email adres is al geregistreerd. Probeer in te loggen of gebruik een ander email adres."
          );
        } else if (
          authError.message.includes("password") ||
          authError.message.includes("Password")
        ) {
          setError(
            "Het wachtwoord voldoet niet aan de vereisten. Gebruik minimaal 6 karakters."
          );
        } else if (
          authError.message.includes("email") ||
          authError.message.includes("Email")
        ) {
          setError("Voer een geldig email adres in.");
        } else if (authError.message.includes("too many requests")) {
          setError(
            "Te veel pogingen. Wacht even voordat u het opnieuw probeert."
          );
        } else if (authError.message.includes("network")) {
          setError(
            "Netwerkfout. Controleer uw internetverbinding en probeer het opnieuw."
          );
        } else {
          setError(
            authError.message ||
              "Er is een fout opgetreden. Probeer het opnieuw."
          );
        }
        return;
      }

      if (authData.user) {
        setSuccess(true);
      }
    } catch (error) {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center ">
          <CardTitle className="text-xl">Uw account is aangemaakt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-center text-sm text-card-foreground">
              We hebben een bevestigingslink naar uw email adres gestuurd. Let
              op dat de email niet in de spam folder terecht is gekomen. Klik op
              de link in de email om uw account te activeren
            </p>
            <div className="mt-4">
              <Link
                className="text-sm inline-flex items-center gap-2"
                href="/auth/signin"
                variant="default"
                type="button"
              >
                Terug naar inloggen
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent w-full">
      <CardHeader className="text-center ">
        <CardTitle className="text-xl">Maak een account</CardTitle>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit} schema={signUpSchema} serverErrors={error}>
          <FormInput
            name="email"
            label="Email adres"
            type="email"
            autoComplete="email"
            placeholder="Email adres"
            className="rounded-t-md"
            validation={{
              required: "Email is verplicht",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Voer een geldig email adres in",
              },
            }}
          />

          <FormInput
            name="password"
            label="Wachtwoord"
            type="password"
            autoComplete="new-password"
            placeholder="Wachtwoord"
            validation={{
              required: "Wachtwoord is verplicht",
              minLength: {
                value: 6,
                message: "Wachtwoord moet minimaal 6 karakters bevatten",
              },
            }}
          />

          <FormInput
            name="confirmPassword"
            label="Bevestig wachtwoord"
            type="password"
            autoComplete="new-password"
            placeholder="Bevestig wachtwoord"
            className="rounded-b-md"
            validation={{
              required: "Bevestig wachtwoord is verplicht",
            }}
          />

          <div className="flex flex-col justify-between gap-2 items-center">
            <SubmitButton className="w-full" isLoading={isLoading}>
              {isLoading ? "Account aanmaken..." : "Account aanmaken"}
            </SubmitButton>

            <span className="text-sm text-muted-foreground lowercase">Of</span>
            <Link className="p-0 h-auto text-sm" href="/auth/signin">
              log in op uw bestaande account
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500">
            Door een account aan te maken, gaat u akkoord met onze{" "}
            <Link className="p-0" href="/terms">
              Algemene Voorwaarden
            </Link>{" "}
            en{" "}
            <Link className="p-0" href="/privacy">
              Privacybeleid
            </Link>
            .
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
