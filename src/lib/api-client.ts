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
      (body && (body.error?.message || body.error || body.message)) || `Request failed: ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return body as T;
}

export const api = {
  // Auth
  signup: (body: { email: string; password: string; full_name?: string }) =>
    apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  forgotPassword: (email: string) =>
    apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  // Data
  profile: () => apiFetch("/user/profile"),
  listScans: () => apiFetch("/scans"),
  createScan: (body: { target_url: string; scan_type?: string; notes?: string }) =>
    apiFetch("/scans", { method: "POST", body: JSON.stringify(body) }),
  listReports: () => apiFetch("/reports"),
  listNotifications: () => apiFetch("/notifications"),
  createTicket: (body: { subject: string; message: string; priority?: string }) =>
    apiFetch("/support/tickets", { method: "POST", body: JSON.stringify(body) }),
  listTickets: () => apiFetch("/support/tickets"),
};
