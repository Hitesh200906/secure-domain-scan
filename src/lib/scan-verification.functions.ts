import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ScanIdInput, ScanOtpInput } from "@/lib/scan-verification.schemas";
import {
  aiCodePresent,
  businessEmailOnSite,
  fetchSiteHtml,
  loadScan,
  sha256,
  sixDigits,
  updateScan,
} from "@/lib/scan-verification.server";

/**
 * Email verification — our AI first confirms the business email is actually
 * published on the target website (contact page or footer). Only then is a
 * one-time code issued to that address.
 */
export const startEmailVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ScanIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { scan } = await loadScan(data.scan_id, context.userId);
    const businessEmail = String(scan.business_email || scan.email || "").trim();
    const targetUrl = String(scan.target_url ?? "").trim();
    if (!businessEmail) throw new Error("No business email was provided for this scan request.");
    if (!targetUrl) throw new Error("No target website was provided for this scan request.");

    let present = false;
    try {
      present = await businessEmailOnSite(targetUrl, businessEmail);
    } catch {
      await updateScan(data.scan_id, {
        verification_status: "failed",
        verification_notes: "Target website could not be reached for email verification",
      });
      return {
        ok: false as const,
        message:
          "We could not reach your website to verify the business email. Make sure it is publicly accessible.",
      };
    }

    if (!present) {
      await updateScan(data.scan_id, {
        verification_status: "failed",
        verification_notes: `Business email ${businessEmail} was not found on ${targetUrl}`,
      });
      return {
        ok: false as const,
        message: `${businessEmail} is not present on your website. Publish it on your contact page or in the footer — we could not complete your scan.`,
      };
    }

    const origin = String(data.origin ?? "").replace(/\/$/, "");
    const redirectTo = `${origin || "https://nexefy.in"}/scan/verify?id=${data.scan_id}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Supabase (project SMTP) delivers the confirmation link to the business email.
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: businessEmail,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });

    await updateScan(data.scan_id, {
      otp_code: null,
      otp_attempts: 0,
      verification_status: "otp_sent",
      verification_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      verification_notes: error
        ? `Business email found; link delivery failed: ${error.message}`
        : "Verification link sent to the business email",
    });

    if (error) {
      return {
        ok: false as const,
        message: `We couldn't send the verification link to ${businessEmail}. Please try again in a moment.`,
      };
    }

    return { ok: true as const, sent_to: businessEmail };
  });

/** Poll from the requester's tab: has the emailed link been confirmed yet? */
export const checkEmailVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ScanIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { scan } = await loadScan(data.scan_id, context.userId);
    return { verified: String(scan.verification_status ?? "") === "verified" };
  });

/**
 * Called from /scan/verify after the recipient clicks the emailed link. The
 * signed-in identity must be the business email on the scan request.
 */
export const confirmEmailVerificationLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ScanIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("scan_requests")
      .select("id, business_email, email, verification_expires_at")
      .eq("id", data.scan_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Scan not found");

    const scan = row as unknown as Record<string, unknown>;
    const target = String(scan.business_email || scan.email || "").toLowerCase();
    const signedIn = String((context.claims as { email?: string } | undefined)?.email ?? "").toLowerCase();
    if (!target || target !== signedIn) {
      throw new Error("This link was issued for a different email address.");
    }

    await updateScan(data.scan_id, {
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      otp_code: null,
      status: "awaiting_config",
      verification_notes: "Verified by emailed confirmation link",
    });
    return { ok: true as const };
  });


/** Manual verification — issue the code the user must place on their site. */
export const startManualVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ScanIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { scan } = await loadScan(data.scan_id, context.userId);
    const code = scan.manual_code ? String(scan.manual_code) : sixDigits();
    await updateScan(data.scan_id, {
      manual_code: code,
      verification_status: "awaiting_site_code",
      verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    return { code, token: `nexefy-site-verification=${code}` };
  });

/** Manual verification — AI-assisted check that the code is live on the site. */
export const confirmManualVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ScanIdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { scan } = await loadScan(data.scan_id, context.userId);
    const code = String(scan.manual_code ?? "");
    if (!code) throw new Error("No verification code issued yet");

    let html = "";
    try {
      html = await fetchSiteHtml(String(scan.target_url ?? ""));
    } catch {
      throw new Error("Could not reach your website. Make sure it is publicly accessible.");
    }

    let found = html.includes(`nexefy-site-verification=${code}`) || html.includes(code);
    if (!found) found = await aiCodePresent(html, code);

    if (!found) {
      await updateScan(data.scan_id, {
        verification_notes: "Automated check could not find the code on the site",
      });
      return { verified: false as const, message: "We couldn't find the code on your site yet." };
    }

    await updateScan(data.scan_id, {
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      status: "awaiting_config",
      verification_notes: "Verified by AI site code check",
    });
    return { verified: true as const, message: "Domain ownership verified." };
  });
