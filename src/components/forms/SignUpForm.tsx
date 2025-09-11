"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Link } from "@/components/ui";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { Form, FormInput, SubmitButton } from "@/components/forms";
import { Alert } from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const router = useRouter();

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowser();
      console.log("Supabase client created");

      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        // Provide more user-friendly error messages
        if (authError.message.includes("already registered")) {
          setError(
            "Dit email adres is al geregistreerd. Probeer in te loggen."
          );
        } else if (authError.message.includes("password")) {
          setError("Het wachtwoord voldoet niet aan de vereisten.");
        } else if (authError.message.includes("email")) {
          setError("Voer een geldig email adres in.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (authData.user) {
        setSuccess(true);
        // Redirect to sign in page after successful signup
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      }
    } catch (error) {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Account aangemaakt!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Uw account is succesvol aangemaakt. U wordt doorgestuurd naar de
          inlogpagina...
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Maak een nieuw account aan</CardTitle>
        <CardDescription>
          Of <Link href="/auth/signin">log in op uw bestaande account</Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit} schema={signUpSchema} className="space-y-6">
          <div className="space-y-4">
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
          </div>

          {error && (
            <Alert variant="destructive">
              <div className="text-sm">{error}</div>
            </Alert>
          )}

          <SubmitButton className="w-full" isLoading={isLoading}>
            {isLoading ? "Account aanmaken..." : "Account aanmaken"}
          </SubmitButton>

          <div className="text-center text-xs text-gray-500">
            Door een account aan te maken, gaat u akkoord met onze{" "}
            <Link href="/terms">Algemene Voorwaarden</Link> en{" "}
            <Link href="/privacy">Privacybeleid</Link>.
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
