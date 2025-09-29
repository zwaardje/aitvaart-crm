"use client";

import { useState } from "react";
import { z } from "zod";
import { Form, FormInput, SubmitButton } from "@/components/forms";
import { Alert } from "@/components/ui";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { schemas } from "@/lib/validation";

const resetSchema = z
  .object({
    password: schemas.common.password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "validation.password.mismatch",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowser();

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError(
          "Deze pagina werkt alleen via de wachtwoord-reset link in uw e-mail. Open de link opnieuw."
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      // Optional: redirect na korte delay naar signin
      setTimeout(() => {
        window.location.href = "/auth/signin";
      }, 2000);
    } catch (e: any) {
      setError(e?.message || "Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Wachtwoord aangepast</h2>
        <p className="text-sm text-muted-foreground">
          U wordt doorgestuurd naar de inlogpagina...
        </p>
      </div>
    );
  }

  return (
    <Form onSubmit={onSubmit} schema={resetSchema} className="space-y-6">
      <div className="space-y-4">
        <FormInput
          name="password"
          label="Nieuw wachtwoord"
          type="password"
          autoComplete="new-password"
          placeholder="Nieuw wachtwoord"
        />

        <FormInput
          name="confirmPassword"
          label="Bevestig wachtwoord"
          type="password"
          autoComplete="new-password"
          placeholder="Bevestig wachtwoord"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <div className="text-sm">{error}</div>
        </Alert>
      )}

      <SubmitButton className="w-full" isLoading={isLoading}>
        {isLoading ? "Opslaan..." : "Wachtwoord opslaan"}
      </SubmitButton>
    </Form>
  );
}
