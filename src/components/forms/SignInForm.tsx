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
  Input,
  Button,
} from "@/components/ui";
import { Form } from "@/components/forms";
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
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center flex flex-col">
        <CardTitle className="text-xl">Inloggen</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <div className="text-sm">{error}</div>
          </Alert>
        )}

        <Form
          onSubmit={onSubmit}
          schema={schemas.auth.signIn}
          className="space-y-4"
        >
          <div className="space-y-4">
            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      placeholder="Email"
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
                  <div className="flex justify-between items-baseline gap-2">
                    <FormLabel>Wachtwoord</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs p-0 h-auto"
                    >
                      Wachtwoord vergeten?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="current-password"
                      placeholder="Wachtwoord"
                      className="rounded-b-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col justify-between gap-2 items-center">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner size={16} /> : "Inloggen"}
            </Button>

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
