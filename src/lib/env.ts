import { z } from "zod";

function resolveSupabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function resolveSupabaseSecretKey() {
  return process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
}

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Ecclesia One"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
});

let publicEnvCache: z.infer<typeof publicEnvSchema> | null = null;
let serverEnvCache: z.infer<typeof serverEnvSchema> | null = null;

export function hasPublicEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && resolveSupabasePublishableKey());
}

export function hasServerEnv(): boolean {
  return hasPublicEnv() && Boolean(resolveSupabaseSecretKey());
}

export function getPublicEnv() {
  if (publicEnvCache) {
    return publicEnvCache;
  }

  publicEnvCache = publicEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: resolveSupabasePublishableKey(),
  });

  return publicEnvCache;
}

export function getServerEnv() {
  if (serverEnvCache) {
    return serverEnvCache;
  }

  serverEnvCache = serverEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: resolveSupabasePublishableKey(),
    SUPABASE_SECRET_KEY: resolveSupabaseSecretKey(),
  });

  return serverEnvCache;
}
