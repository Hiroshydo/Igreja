import type { NextRequest } from "next/server";

import { getRequestAuditMetadata } from "@/lib/auth/session";
import { hasServerEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AccessContext } from "@/types";

export async function writeAuditLog(options: {
  request: NextRequest;
  context: AccessContext;
  action: string;
  entityName: string;
  entityId?: string;
  beforeData?: unknown;
  afterData?: unknown;
}) {
  if (!hasServerEnv()) {
    return;
  }

  const { ipAddress, userAgent } = getRequestAuditMetadata(options.request);
  const admin = createAdminSupabaseClient();

  await admin.from("audit_logs").insert({
    congregation_id: options.context.congregationId,
    actor_user_id: options.context.userId,
    actor_email: options.context.email,
    action: options.action,
    entity_name: options.entityName,
    entity_id: options.entityId,
    ip_address: ipAddress,
    user_agent: userAgent,
    before_data: options.beforeData ?? null,
    after_data: options.afterData ?? null,
  });
}
