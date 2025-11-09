"use client";

import { useState } from "react";
import { z } from "zod";
import { Form, FormInput, SubmitButton } from "@/components/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { schemas } from "@/lib/validation";
import { Link } from "@/components/ui";

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
      <Card className="border-none shadow-none bg-transparent w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Uw wachtwoord is aangepast</CardTitle>
          <CardDescription>
            U wordt doorgestuurd naar de inlogpagina...
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
        <CardTitle className="text-2xl">Wachtwoord resetten</CardTitle>
        <CardDescription>
          Stel een nieuw wachtwoord in voor uw account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form onSubmit={onSubmit} schema={resetSchema} serverErrors={error}>
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

          <div className="flex flex-col justify-between gap-2 items-center">
            <SubmitButton className="w-full" isLoading={isLoading}>
              {isLoading ? "Opslaan..." : "Wachtwoord opslaan"}
            </SubmitButton>
            <span className="text-sm text-muted-foreground lowercase">Of</span>
            <Link className="p-0 h-auto text-sm" href="/auth/signin">
              Terug naar inloggen
            </Link>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
