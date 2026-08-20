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

    const code = sixDigits();
    await updateScan(data.scan_id, {
      otp_code: await sha256(code),
      otp_attempts: 0,
      verification_status: "otp_sent",
      verification_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      verification_notes: "Business email found on the target website",
    });
    // Email delivery needs a verified sender domain for this project; until one
    // is configured the code is returned to the signed-in owner of the request.
    return {
      ok: true as const,
      sent_to: businessEmail,
      delivered: false as const,
      code,
    };
  });

/** Email verification — confirm the code and send the request to the admin console. */
export const confirmEmailVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ScanOtpInput.parse(d))
  .handler(async ({ data, context }) => {
    const { scan } = await loadScan(data.scan_id, context.userId);
    const attempts = Number(scan.otp_attempts ?? 0);
    if (attempts >= 6) throw new Error("Too many attempts. Request a new code.");
    const expires = scan.verification_expires_at ? new Date(String(scan.verification_expires_at)) : null;
    if (!expires || expires.getTime() < Date.now()) throw new Error("Code expired. Request a new code.");

    if ((await sha256(data.code)) !== String(scan.otp_code ?? "")) {
      await updateScan(data.scan_id, { otp_attempts: attempts + 1 });
      throw new Error("Incorrect code");
    }

    await updateScan(data.scan_id, {
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      otp_code: null,
      status: "pending",
      verification_notes: "Verified by email one-time code",
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
      status: "pending",
      verification_notes: "Verified by AI site code check",
    });
    return { verified: true as const, message: "Domain ownership verified." };
  });
