/**
 * Thin client for the Render-hosted Express backend.
 *
 * Set VITE_API_BASE_URL in Vercel → Project Settings → Environment Variables, e.g.
 *   VITE_API_BASE_URL=https://YOUR-RENDER-URL.onrender.com/api
 *
 * The Supabase access token (from supabase.auth.getSession()) is forwarded as a
 * Bearer header so the backend can authorize the call via RLS.
 */
import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8080/api";

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeader()),
    ...((init.headers as Record<string, string>) ?? {}),
  };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      (body && (body.error?.message || body.error || body.message)) ||
      `Request failed: ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return body as T;
}

// ---- Typed payload shapes ----
type Id = string;
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
type TicketInput = {
  subject: string;
  message: string;
  name?: string;
  email?: string;
  priority?: string;
};
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
type AuditInput = {
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
};

export const api = {
  // ---- Auth (backend wrappers — frontend currently uses supabase.auth.* directly) ----
  signup: (body: { email: string; password: string; full_name?: string }) =>
    apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  forgotPassword: (email: string) =>
    apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  // ---- Public ----
  publicPricing: () => apiFetch<{ plans: any[] }>("/public/pricing"),

  // ---- Current user ----
  profile: () => apiFetch<{ profile: any }>("/user/profile"),
  updateProfile: (patch: ProfilePatch) =>
    apiFetch<{ ok: true }>("/user/profile", { method: "PATCH", body: JSON.stringify(patch) }),

  // ---- Scans ----
  listScans: () => apiFetch<{ scans: any[] }>("/scans"),
  createScan: (body: ScanInput) =>
    apiFetch<{ scan: any }>("/scans", { method: "POST", body: JSON.stringify(body) }),

  // ---- Reports ----
  listReports: () => apiFetch<{ reports: any[] }>("/reports"),

  // ---- Notifications ----
  listNotifications: () => apiFetch<{ notifications: any[] }>("/notifications"),

  // ---- Support ----
  createTicket: (body: TicketInput) =>
    apiFetch<{ ticket: any }>("/support/tickets", { method: "POST", body: JSON.stringify(body) }),
  listTickets: () => apiFetch<{ tickets: any[] }>("/support/tickets"),
  listTicketMessages: (ticketId: Id) =>
    apiFetch<{ messages: any[] }>(`/support/tickets/${ticketId}/messages`),
  sendTicketMessage: (ticketId: Id, body: string, author_name?: string) =>
    apiFetch<{ ok: true }>(`/support/tickets/${ticketId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body, author_name }),
    }),

  // ---- Audit ----
  audit: (body: AuditInput) =>
    apiFetch<{ ok: true }>("/audit", { method: "POST", body: JSON.stringify(body) }),

  // ---- Admin ----
  admin: {
    listUsers: () => apiFetch<{ users: any[] }>("/admin/users"),
    updateUser: (id: Id, patch: AdminUserPatch) =>
      apiFetch<{ ok: true }>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

    listScans: (userId?: Id) =>
      apiFetch<{ scans: any[] }>(`/admin/scans${userId ? `?user_id=${encodeURIComponent(userId)}` : ""}`),
    updateScan: (id: Id, patch: AdminScanPatch) =>
      apiFetch<{ ok: true }>(`/admin/scans/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    deleteScan: (id: Id) =>
      apiFetch<{ ok: true }>(`/admin/scans/${id}`, { method: "DELETE" }),

    listReports: () => apiFetch<{ reports: any[] }>("/admin/reports"),
    createReport: (body: AdminReportInput) =>
      apiFetch<{ report: any }>("/admin/reports", { method: "POST", body: JSON.stringify(body) }),
    deleteReport: (id: Id) =>
      apiFetch<{ ok: true }>(`/admin/reports/${id}`, { method: "DELETE" }),

    listTickets: () => apiFetch<{ tickets: any[] }>("/admin/tickets"),
    ticketMessages: (id: Id) => apiFetch<{ messages: any[] }>(`/admin/tickets/${id}/messages`),
    replyTicket: (id: Id, body: string) =>
      apiFetch<{ ok: true }>(`/admin/tickets/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),

    listPricing: () => apiFetch<{ plans: any[] }>("/admin/pricing"),
    updatePricing: (id: Id, patch: AdminPricingPatch) =>
      apiFetch<{ ok: true }>(`/admin/pricing/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

    listAdmins: () => apiFetch<{ admins: any[] }>("/admin/admins"),
    createAdmin: (body: AdminCreateAdmin) =>
      apiFetch<{ admin: any }>("/admin/admins", { method: "POST", body: JSON.stringify(body) }),
    updateAdmin: (id: Id, patch: { active?: boolean; role?: string }) =>
      apiFetch<{ ok: true }>(`/admin/admins/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    deleteAdmin: (id: Id) =>
      apiFetch<{ ok: true }>(`/admin/admins/${id}`, { method: "DELETE" }),

    listAuditLogs: () => apiFetch<{ logs: any[] }>("/admin/audit"),
  },
};
