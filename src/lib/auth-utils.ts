// src/lib/auth-utils.ts
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

/**
 * Hook to get the current user from Supabase Auth
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

/**
 * Hook to get the current user ID from Supabase Auth
 */
export function useCurrentUserId() {
  const { user } = useCurrentUser();
  return user?.id || null;
}

/**
 * Utility function to get user ID from Supabase Auth (for use outside of React components)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}
