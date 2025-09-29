"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  Link,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  Input,
  Button,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { Form, FormInput, SubmitButton } from "@/components/forms";
import { Alert } from "@/components/ui/Alert";
import {
  Form as ShadcnForm,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// import { ProviderButtons } from "@/components/auth";
import { schemas, type SignInFormData } from "@/lib/validation";

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations();

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
        // Provide more specific error messages
        if (authError.message.includes("Invalid login credentials")) {
          setError(
            "Ongeldige inloggegevens. Controleer uw email en wachtwoord."
          );
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Controleer uw email voor een bevestigingslink.");
        } else {
          setError("Er is een fout opgetreden bij het inloggen.");
        }
      } else if (authData.user) {
        // Successfully signed in
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">{t("auth.signIn.title")}</CardTitle>
        <CardDescription>
          {t("auth.signIn.subtitle")}{" "}
          <Link href="/auth/signup">{t("auth.signIn.createAccount")}</Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={onSubmit}
          schema={schemas.auth.signIn}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.signIn.email")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      placeholder={t("auth.signIn.email")}
                      className="rounded-t-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.signIn.password")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="current-password"
                      placeholder={t("auth.signIn.password")}
                      className="rounded-b-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <div className="text-sm">{error}</div>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("auth.signIn.submitting") : t("auth.signIn.submit")}
          </Button>

          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-sm">
              {t("auth.signIn.forgotPassword")}
            </Link>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
