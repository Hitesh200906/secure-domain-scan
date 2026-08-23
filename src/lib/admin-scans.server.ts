import type { SupabaseClient } from "@supabase/supabase-js";

const ADMIN_ROLES = ["admin", "super_admin", "master_admin"] as const;

/** Throws unless the calling account holds an admin console role. */
export async function assertAdmin(supabase: SupabaseClient, userId: string) {
  for (const role of ADMIN_ROLES) {
    const { data } = await supabase.rpc("has_role" as never, { _user_id: userId, _role: role } as never);
    if (data === true) return;
  }
  throw new Error("Admin access required.");
}

export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
