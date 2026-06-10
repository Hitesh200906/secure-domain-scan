import { supabase } from "@/integrations/supabase/client";

export async function logAudit(
  action: string,
  target?: { type: string; id: string },
  metadata: Record<string, unknown> = {},
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      actor_email: user?.email ?? null,
      actor_role: "admin",
      action,
      target_type: target?.type ?? null,
      target_id: target?.id ?? null,
      metadata: metadata as never,
    });
  } catch {
    // best-effort
  }
}
