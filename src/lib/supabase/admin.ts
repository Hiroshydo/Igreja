import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminSupabaseClient() {
  if (adminClient) {
    return adminClient;
  }

  const env = getServerEnv();
  adminClient = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
