"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  Link,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { Form, FormInput, SubmitButton } from "@/components/forms";

// import { ProviderButtons } from "@/components/auth";
import { schemas, type SignInFormData } from "@/lib/validation";
import { Spinner } from "@/components/ui/spinner/Spinner";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowser();
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        // Provide more specific and user-friendly error messages
        if (
          authError.message.includes("Invalid login credentials") ||
          authError.message.includes("invalid")
        ) {
          setError(
            "Ongeldige inloggegevens. Controleer uw email en wachtwoord."
          );
        } else if (
          authError.message.includes("Email not confirmed") ||
          authError.message.includes("email_not_confirmed")
        ) {
          setError(
            "Uw email adres is nog niet bevestigd. Controleer uw inbox voor een bevestigingslink."
          );
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
            authError.message || "Er is een fout opgetreden bij het inloggen."
          );
        }
        return;
      }

      if (authData.user && authData.session) {
        // Successfully signed in - redirect to dashboard
        router.push("/dashboard");
        router.refresh(); // Refresh to ensure session is updated
      }
    } catch (error) {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Inloggen</CardTitle>
        <CardDescription>
          Welkom terug bij uw account. Voer uw email en wachtwoord in om in te
          loggen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={onSubmit}
          schema={schemas.auth.signIn}
          serverErrors={error}
        >
          <FormInput
            name="email"
            label="Email adres"
            type="email"
            autoComplete="email"
            placeholder="Email adres"
            className="rounded-t-md"
            suffix={
              <Link href="/auth/forgot-password" className="text-xs p-0 h-auto">
                Wachtwoord vergeten?
              </Link>
            }
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

          <div className="flex flex-col justify-between gap-2 items-center">
            <SubmitButton className="w-full" isLoading={isLoading}>
              {isLoading ? "Account aanmaken..." : "Account aanmaken"}
            </SubmitButton>

            <span className="text-sm text-muted-foreground lowercase">Of</span>
            <Link className="p-0 h-auto text-sm" href="/auth/signup">
              Account aanmaken
            </Link>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
