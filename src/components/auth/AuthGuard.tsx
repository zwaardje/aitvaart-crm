"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth-utils";
import { useTranslations } from "next-intl";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (loading) return; // Still loading

    if (!user) {
      // Redirect to login page
      router.push("/auth/signin");
      return;
    }
  }, [user, loading, router]);

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
