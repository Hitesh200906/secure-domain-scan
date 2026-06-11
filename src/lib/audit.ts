import { api } from "@/lib/api-client";

/**
 * Audit logging — POSTs to the backend (which writes to audit_logs via RLS).
 * Best-effort: never throws.
 */
export async function logAudit(
  action: string,
  target?: { type: string; id: string },
  metadata: Record<string, unknown> = {},
) {
  try {
    await api.audit({
      action,
      target_type: target?.type,
      target_id: target?.id,
      metadata,
    });
  } catch {
    // best-effort
  }
}
