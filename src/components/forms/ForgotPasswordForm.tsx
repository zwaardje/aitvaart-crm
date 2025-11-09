"use client";

import { useState } from "react";
import { Form, FormInput, SubmitButton } from "@/components/forms";
import { Alert, Link } from "@/components/ui";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { schemas, type ForgotPasswordFormData } from "@/lib/validation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-none shadow-none bg-transparent w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Email verzonden!</CardTitle>
          <CardDescription>
            Controleer uw email voor instructies om uw wachtwoord te resetten.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-between gap-2 items-center">
          <Link href="/auth/signin" type="button" variant="default">
            Terug naar inloggen
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Wachtwoord vergeten?</CardTitle>
        <CardDescription>
          Voer uw email adres in en wij sturen u een link om uw wachtwoord te
          resetten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={onSubmit}
          schema={schemas.auth.forgotPassword}
          serverErrors={error}
        >
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

          <div className="flex flex-col justify-between gap-2 items-center">
            <SubmitButton className="w-full" isLoading={isLoading}>
              {isLoading ? "Verzenden..." : "Reset link verzenden"}
            </SubmitButton>

            <span className="text-sm text-muted-foreground lowercase">of</span>

            <Link className="p-0 h-auto text-sm" href="/auth/signin">
              Terug naar inloggen
            </Link>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
