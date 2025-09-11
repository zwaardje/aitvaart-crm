// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

// Only create admin client if service role key is available
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { "X-Client-Info": "crm-admin" } },
      }
    )
  : null;

// Helper function to get admin client with error handling
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase admin client not available. SUPABASE_SERVICE_ROLE_KEY is required."
    );
  }
  return supabaseAdmin;
}
