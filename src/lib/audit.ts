import { supabase } from "@/integrations/supabase/client";

export async function logAudit(action: string, target?: { type: string; id: string }, metadata: Record<string, unknown> = {}) {
  try {
    await supabase.from("audit_logs").insert({
      actor_email: "admin@nexus.local",
      actor_role: "super_admin",
      action,
      target_type: target?.type ?? null,
      target_id: target?.id ?? null,
      metadata,
    });
  } catch {
    // best-effort
  }
}
