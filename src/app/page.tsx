import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not authenticated, redirect to signin
  if (!user) {
    redirect("/auth/signin");
  }

  // If user is authenticated, redirect to dashboard
  // The OnboardingGuard will handle onboarding checks
  redirect("/dashboard");
}
