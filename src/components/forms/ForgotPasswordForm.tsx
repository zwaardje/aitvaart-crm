"use client";

import { useState } from "react";
import { Form, FormInput, SubmitButton } from "@/components/forms";
import { Alert, Link } from "@/components/ui";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { schemas, type ForgotPasswordFormData } from "@/lib/validation";

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
      <div className="text-center space-y-4">
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
        <h2 className="text-2xl font-bold">Email verzonden!</h2>
        <p className="text-sm text-gray-600">
          Controleer uw email voor instructies om uw wachtwoord te resetten.
        </p>
        <Link href="/auth/signin">Terug naar inloggen</Link>
      </div>
    );
  }

  return (
    <Form
      onSubmit={onSubmit}
      schema={schemas.auth.forgotPassword}
      className="space-y-6"
    >
      <div className="space-y-4">
        <FormInput
          name="email"
          label="Email adres"
          type="email"
          autoComplete="email"
          placeholder="Email adres"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <div className="text-sm">{error}</div>
        </Alert>
      )}

      <SubmitButton className="w-full" isLoading={isLoading}>
        {isLoading ? "Verzenden..." : "Reset link verzenden"}
      </SubmitButton>

      <div className="text-center">
        <Link href="/auth/signin" className="text-sm">
          Terug naar inloggen
        </Link>
      </div>
    </Form>
  );
}
