import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ScanIdInput } from "@/lib/scan-verification.schemas";
import { SubmitScanConfigInput } from "@/lib/scan-config.schemas";
import { loadScan, updateScan } from "@/lib/scan-verification.server";
import { dispatchToScanner } from "@/lib/scan-config.server";

/**
 * Loads the verified submission behind the configuration step. The target URL
 * and ownership status always come from the stored record, never from the
 * client, so the second form can't be used to retarget a scan.
 */
export const getVerifiedScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ScanIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { scan } = await loadScan(data.scan_id, context.userId);
    return {
      id: String(scan.id),
      target_url: String(scan.target_url ?? ""),
      plan: String(scan.plan ?? ""),
      status: String(scan.status ?? ""),
      verification_status: String(scan.verification_status ?? ""),
      config_submitted: Boolean(scan.scan_config),
    };
  });

/** Final step — validate everything server-side and queue the scan job. */
export const submitScanConfiguration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SubmitScanConfigInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin, scan } = await loadScan(data.scan_id, context.userId);

    if (String(scan.verification_status) !== "verified") {
      throw new Error("Domain ownership is not verified for this request.");
    }
    if (scan.scan_config) {
      throw new Error("This scan request has already been configured.");
    }
    const targetUrl = String(scan.target_url ?? "").trim();
    if (!targetUrl) throw new Error("This request has no verified target website.");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("credits, status")
      .eq("id", context.userId)
      .maybeSingle();
    const p = profile as { credits?: number | null; status?: string | null } | null;
    if (p?.status === "banned") throw new Error("This account is suspended.");

    // Rate limit — no more than 5 queued scans per user at a time.
    const { count } = await supabaseAdmin
      .from("scan_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .in("status", ["pending", "in_progress"]);
    if ((count ?? 0) >= 5) {
      throw new Error("You already have several scans in the queue. Please wait for them to finish.");
    }

    await updateScan(data.scan_id, {
      scan_config: data.config,
      config_submitted_at: new Date().toISOString(),
      status: "pending",
    });

    const dispatched = await dispatchToScanner({
      scan_id: data.scan_id,
      user_id: context.userId,
      target_url: targetUrl,
      plan: String(scan.plan ?? ""),
      full_name: String(scan.full_name ?? ""),
      company: String(scan.company ?? ""),
      email: String(scan.email ?? ""),
      business_email: String(scan.business_email ?? ""),
      config: data.config,
    });

    return { ok: true as const, dispatched, credits: p?.credits ?? 0 };
  });
