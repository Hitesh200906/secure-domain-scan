/**
 * Frontend data layer — talks directly to Lovable Cloud (Supabase) using RLS.
 *
 * The previous implementation depended on an Express backend hosted on Render
 * via VITE_API_BASE_URL. In Lovable previews that backend isn't reachable, so
 * profile reads and every admin mutation failed with "unable to fetch".
 * This module preserves the same `api.*` surface but is now backed by the
 * Supabase publishable client (and the existing RLS policies).
 */
import { supabase } from "@/integrations/supabase/client";

type Id = string;
type ProfilePatch = { full_name?: string; role_title?: string; company?: string };
type AdminUserPatch = {
  plan?: string;
  status?: string;
  credits?: number;
  full_name?: string;
};
type AdminScanPatch = { status?: string; notes?: string };
type AdminReportInput = {
  scan_id?: Id;
  user_id: Id;
  title: string;
  summary?: string;
  file_url?: string;
  severity?: "low" | "medium" | "high" | "critical";
};
type AdminPricingPatch = {
  name?: string;
  headline?: string | null;
  description?: string | null;
  price_monthly?: number;
  price_label?: string | null;
  credits?: number;
  features?: string[];
  popular?: boolean;
  cta_label?: string | null;
  active?: boolean;
};
type AdminCreateAdmin = { email: string; full_name?: string; role?: "admin" | "super_admin" };
type TicketInput = {
  subject: string;
  message: string;
  name?: string;
  email?: string;
  priority?: string;
};
type ScanInput = {
  target_url: string;
  full_name?: string;
  role_title?: string;
  company?: string;
  email?: string;
  business_email?: string;
  plan?: string;
  verification_method?: string;
};
type AuditInput = {
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
};

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

async function currentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export const api = {
  // ---- Public ----
  publicPricing: async () => {
    const { data, error } = await supabase
      .from("pricing_plans")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { plans: data ?? [] };
  },

  // ---- Current user ----
  profile: async () => {
    const user = await currentUser();
    if (!user) return { profile: null };
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  },
  updateProfile: async (patch: ProfilePatch) => {
    const user = await currentUser();
    if (!user) throw new Error("Not signed in");
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Scans ----
  listScans: async () => {
    const user = await currentUser();
    if (!user) return { scans: [] };
    const { data, error } = await supabase
      .from("scan_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { scans: data ?? [] };
  },
  createScan: async (body: ScanInput) => {
    const user = await currentUser();
    if (!user) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("scan_requests")
      .insert({ ...body, user_id: user.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { scan: data };
  },

  // ---- Reports ----
  listReports: async () => {
    const user = await currentUser();
    if (!user) return { reports: [] };
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { reports: data ?? [] };
  },

  // ---- Notifications ----
  listNotifications: async () => {
    const user = await currentUser();
    if (!user) return { notifications: [] };
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { notifications: data ?? [] };
  },

  // ---- Support ----
  createTicket: async (body: TicketInput) => {
    const user = await currentUser();
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        subject: body.subject,
        message: body.message,
        name: body.name ?? user?.user_metadata?.full_name ?? "",
        email: body.email ?? user?.email ?? "",
        priority: body.priority ?? "normal",
        user_id: user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ticket: data };
  },
  listTickets: async () => {
    const user = await currentUser();
    if (!user) return { tickets: [] };
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { tickets: data ?? [] };
  },
  listTicketMessages: async (ticketId: Id) => {
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { messages: data ?? [] };
  },
  sendTicketMessage: async (ticketId: Id, body: string, author_name?: string) => {
    const user = await currentUser();
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      body,
      author_name: author_name ?? user?.email ?? null,
      author_type: "user",
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Audit ----
  audit: async (body: AuditInput) => {
    const user = await currentUser();
    const { error } = await supabase.from("audit_logs").insert({
      action: body.action,
      target_type: body.target_type ?? null,
      target_id: body.target_id ?? null,
      metadata: body.metadata ?? {},
      actor_email: user?.email ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Role helpers ----
  getMyRole: async () => {
    const user = await currentUser();
    if (!user) return { role: null };
    const { data, error } = await supabase.rpc("get_user_role", { _user_id: user.id });
    if (error) throw new Error(error.message);
    return { role: (data as string | null) ?? null };
  },
  grantRole: async (
    user_id: Id,
    role: "master_admin" | "super_admin" | "admin" | "user",
  ) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id, role });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  },

  // ---- Admin ----
  admin: {
    listUsers: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return { users: data ?? [] };
    },
    updateUser: async (id: Id, patch: AdminUserPatch) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },

    listScans: async (userId?: Id) => {
      let q = supabase
        .from("scan_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (userId) q = q.eq("user_id", userId);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return { scans: data ?? [] };
    },
    updateScan: async (id: Id, patch: AdminScanPatch) => {
      const { error } = await supabase.from("scan_requests").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },
    deleteScan: async (id: Id) => {
      const { error } = await supabase.from("scan_requests").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },

    listReports: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return { reports: data ?? [] };
    },
    createReport: async (body: AdminReportInput) => {
      const { data, error } = await supabase
        .from("reports")
        .insert({ ...body, findings: {} })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { report: data };
    },
    deleteReport: async (id: Id) => {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },

    listTickets: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return { tickets: data ?? [] };
    },
    updateTicket: async (
      id: Id,
      patch: { status?: string; priority?: string; assigned_to?: string | null },
    ) => {
      const { error } = await supabase.from("support_tickets").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },
    ticketMessages: async (id: Id) => {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return { messages: data ?? [] };
    },
    replyTicket: async (id: Id, body: string) => {
      const user = await currentUser();
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: id,
        body,
        author_name: user?.email ?? "Admin",
        author_type: "admin",
      });
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },

    listPricing: async () => {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return { plans: data ?? [] };
    },
    updatePricing: async (id: Id, patch: AdminPricingPatch) => {
      // Enforce single "popular" plan client-side as a UX guard.
      if (patch.popular === true) {
        await supabase.from("pricing_plans").update({ popular: false }).neq("id", id);
      }
      const { error } = await supabase.from("pricing_plans").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },

    listAdmins: async () => {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return { admins: data ?? [] };
    },
    createAdmin: async (body: AdminCreateAdmin) => {
      const { data, error } = await supabase
        .from("admins")
        .insert({
          email: body.email,
          full_name: body.full_name ?? null,
          role: body.role ?? "admin",
          active: true,
          permissions: {},
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { admin: data };
    },
    updateAdmin: async (id: Id, patch: { active?: boolean; role?: string }) => {
      const { error } = await supabase.from("admins").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },
    deleteAdmin: async (id: Id) => {
      const { error } = await supabase.from("admins").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    },

    listAuditLogs: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return { logs: data ?? [] };
    },
  },
};

// Backwards-compat: a couple of legacy modules still imported `apiFetch`.
// Kept as a tiny shim that errors loudly so future calls migrate to `api.*`.
export async function apiFetch<T = unknown>(path: string): Promise<T> {
  throw new Error(`apiFetch is deprecated. Migrate ${path} to the Supabase-backed api.*`);
}

// Silence unused-helper warning when no method currently uses it.
void unwrap;
