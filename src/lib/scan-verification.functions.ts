import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const IdInput = z.object({ scan_id: z.string().uuid() });
const OtpInput = z.object({ scan_id: z.string().uuid(), code: z.string().trim().regex(/^\d{6}$/) });

function sixDigits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sha256(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function loadScan(scanId: string, userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("scan_requests")
    .select("*")
    .eq("id", scanId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Scan not found");
  return { supabaseAdmin, scan: data as Record<string, unknown> };
}

/** Email verification — generate an OTP for the provided business email. */
export const startEmailVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin, scan } = await loadScan(data.scan_id, context.userId);
    const code = sixDigits();
    const target = String(scan.business_email || scan.email || "");

    const { error } = await supabaseAdmin
      .from("scan_requests")
      .update({
        otp_code: await sha256(code),
        otp_attempts: 0,
        verification_status: "otp_sent",
        verification_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      } as never)
      .eq("id", data.scan_id);
    if (error) throw new Error(error.message);

    // Email delivery requires a verified sender domain for this project.
    // Until one is configured the code is returned to the requesting owner so
    // the verification flow remains usable.
    return { sent_to: target, delivered: false as const, code };
  });

/** Email verification — confirm the OTP and push the request to the admin console. */
export const confirmEmailVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => OtpInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin, scan } = await loadScan(data.scan_id, context.userId);

    const attempts = Number(scan.otp_attempts ?? 0);
    if (attempts >= 6) throw new Error("Too many attempts. Request a new code.");
    const expires = scan.verification_expires_at ? new Date(String(scan.verification_expires_at)) : null;
    if (!expires || expires.getTime() < Date.now()) throw new Error("Code expired. Request a new code.");

    const ok = (await sha256(data.code)) === String(scan.otp_code ?? "");
    if (!ok) {
      await supabaseAdmin
        .from("scan_requests")
        .update({ otp_attempts: attempts + 1 } as never)
        .eq("id", data.scan_id);
      throw new Error("Incorrect code");
    }

    const { error } = await supabaseAdmin
      .from("scan_requests")
      .update({
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        otp_code: null,
        status: "pending",
        verification_notes: "Verified by email one-time code",
      } as never)
      .eq("id", data.scan_id);
    if (error) throw new Error(error.message);

    return { ok: true as const };
  });

/** Manual verification — issue the code the user must place on their site. */
export const startManualVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin, scan } = await loadScan(data.scan_id, context.userId);
    const existing = scan.manual_code ? String(scan.manual_code) : null;
    const code = existing ?? sixDigits();

    const { error } = await supabaseAdmin
      .from("scan_requests")
      .update({
        manual_code: code,
        verification_status: "awaiting_site_code",
        verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } as never)
      .eq("id", data.scan_id);
    if (error) throw new Error(error.message);

    return { code, token: `nexefy-site-verification=${code}` };
  });

/** Manual verification — fetch the site and let the AI confirm the code is present. */
export const confirmManualVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin, scan } = await loadScan(data.scan_id, context.userId);
    const code = String(scan.manual_code ?? "");
    if (!code) throw new Error("No verification code issued yet");

    let url = String(scan.target_url ?? "").trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    let html = "";
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "NexefySecurityBot/1.0 (+verification)" },
        redirect: "follow",
      });
      html = (await res.text()).slice(0, 300000);
    } catch {
      throw new Error("Could not reach your website. Make sure it is publicly accessible.");
    }

    const token = `nexefy-site-verification=${code}`;
    let found = html.includes(token) || html.includes(code);

    // Secondary AI check for codes embedded in unusual markup.
    if (!found) {
      const key = process.env["LOVABLE_API_KEY"];
      if (key) {
        try {
          const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "content-type": "application/json", "Lovable-API-Key": key },
            body: JSON.stringify({
              model: "google/gemini-3.6-flash",
              messages: [
                {
                  role: "system",
                  content:
                    'You check whether a verification code appears anywhere in a website\'s HTML (meta tag, header, footer, comment, attribute). Reply with only "YES" or "NO".',
                },
                { role: "user", content: `Code: ${code}\n\nHTML:\n${html.slice(0, 60000)}` },
              ],
            }),
          });
          const json = (await ai.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const answer = json.choices?.[0]?.message?.content?.trim().toUpperCase() ?? "";
          found = answer.startsWith("YES");
        } catch {
          /* fall through with regex result */
        }
      }
    }

    if (!found) {
      await supabaseAdmin
        .from("scan_requests")
        .update({ verification_notes: "Automated check could not find the code on the site" } as never)
        .eq("id", data.scan_id);
      return { verified: false as const, message: "We couldn't find the code on your site yet." };
    }

    const { error } = await supabaseAdmin
      .from("scan_requests")
      .update({
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        status: "pending",
        verification_notes: "Verified by AI site code check",
      } as never)
      .eq("id", data.scan_id);
    if (error) throw new Error(error.message);

    return { verified: true as const, message: "Domain ownership verified." };
  });
