import { NextResponse } from "next/server";

import { hasPublicEnv, hasServerEnv } from "@/lib/env";

/**
 * GET /api/health
 * Health check endpoint - verifica se o servidor está funcionando
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    status: hasPublicEnv() ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    supabase: {
      publicEnvConfigured: hasPublicEnv(),
      serverEnvConfigured: hasServerEnv(),
    },
  });
}
