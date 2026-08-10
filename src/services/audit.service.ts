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

  if (!options.context.congregationId) {
    return;
  }

  const { error } = await (admin as any).rpc("write_audit_log", {
    p_action: options.action,
    p_entity_name: options.entityName,
    p_entity_id: options.entityId ?? null,
    p_before_data: options.beforeData ?? null,
    p_after_data: options.afterData ?? null,
    p_actor_user_id: options.context.userId,
    p_actor_email: options.context.email,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
    p_congregation_id: options.context.congregationId,
  });

  if (error) {
    throw error;
  }
}
