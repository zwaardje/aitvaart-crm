// src/lib/supabase/browser.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;
let isInitializing = false;

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    throw new Error("Supabase client is already being initialized");
  }

  isInitializing = true;

  try {
    browserClient = createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          fetch: async (...args) => {
            const res = await fetch(...args);

            const triggerSignOut = async () => {
              try {
                await browserClient?.auth.signOut();
              } catch {}
              if (typeof window !== "undefined") {
                window.location.href = "/auth/signin";
              }
            };

            if (res.status === 401) {
              await triggerSignOut();
              return res;
            }

            // If the refresh token endpoint returns 400, the token is invalid/used
            const [input] = args as [RequestInfo, RequestInit?];
            const url =
              typeof input === "string"
                ? input
                : (input as Request | undefined)?.url || "";
            if (res.status === 400 && url.includes("/auth/v1/token")) {
              await triggerSignOut();
              return res;
            }

            return res;
          },
        },
      }
    );

    return browserClient;
  } finally {
    isInitializing = false;
  }
}

// Cleanup function for proper memory management
export function cleanupSupabaseClient() {
  if (browserClient) {
    browserClient.auth.signOut().catch(() => {});
    browserClient = undefined;
  }
}
