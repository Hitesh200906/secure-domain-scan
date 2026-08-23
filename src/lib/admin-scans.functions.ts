import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, randomToken } from "@/lib/admin-scans.server";
import { dispatchToScanner } from "@/lib/scan-config.server";

const IdInput = z.object({ id: z.string().uuid() });

/**
 * Admin action — sends a submitted scan form to the external AI scanner.
 * The scanner posts its finished report back to /api/public/scanner-report.
 */
export const adminDispatchScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("scan_requests")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Scan request not found.");
    const scan = row as unknown as Record<string, unknown>;

    if (!scan["scan_config"]) throw new Error("This request has no submitted configuration form yet.");
    const targetUrl = String(scan["target_url"] ?? "").trim();
    if (!targetUrl) throw new Error("This request has no target website.");

    const token = randomToken();
    const origin = new URL(
      (await import("@tanstack/react-start/server")).getRequest().url,
    ).origin;

    const result = await dispatchToScanner({
      scan_id: String(scan["id"]),
      user_id: String(scan["user_id"]),
      target_url: targetUrl,
      plan: String(scan["plan"] ?? ""),
      full_name: String(scan["full_name"] ?? ""),
      company: String(scan["company"] ?? ""),
      email: String(scan["email"] ?? ""),
      business_email: String(scan["business_email"] ?? ""),
      config: scan["scan_config"] as never,
      callback_url: `${origin}/api/public/scanner-report`,
      callback_token: token,
    });

    await supabaseAdmin
      .from("scan_requests")
      .update({
        callback_token: token,
        dispatched_at: new Date().toISOString(),
        dispatch_error: result.ok ? null : (result.error ?? "Dispatch failed"),
        status: result.ok ? "in_progress" : String(scan["status"] ?? "pending"),
      } as never)
      .eq("id", data.id);

    if (!result.ok) throw new Error(result.error ?? "Could not reach the scanner.");
    return { ok: true as const };
  });

/** Admin action — releases a received report to the customer. */
export const adminReleaseReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("reports")
      .select("id, user_id, title, delivered_at, scan_id")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Report not found.");
    const report = row as unknown as { id: string; user_id: string | null; delivered_at: string | null };
    if (report.delivered_at) return { ok: true as const, already: true };

    await supabaseAdmin
      .from("reports")
      .update({ delivered_at: new Date().toISOString() } as never)
      .eq("id", data.id);

    if (report.user_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: report.user_id,
        title: "Your security report is ready",
        body: "Your scan report has been reviewed and released. Open your dashboard to read it.",
        link: "/dashboard",
      } as never);
    }
    return { ok: true as const, already: false };
  });

/** Admin view — reports received from the scanner for one scan request. */
export const adminListScanReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("reports")
      .select("id, title, summary, severity, delivered_at, created_at")
      .eq("scan_id", data.id)
      .order("created_at", { ascending: false });
    return {
      reports: (rows ?? []) as unknown as Array<{
        id: string;
        title: string;
        summary: string | null;
        severity: string | null;
        delivered_at: string | null;
        created_at: string;
      }>,
    };
  });
