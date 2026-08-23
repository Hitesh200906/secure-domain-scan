import type { ScanConfig } from "@/lib/scan-config.schemas";

/** External AI scanner endpoint. Override with SCANNER_WEBHOOK_URL if it changes. */
export const SCANNER_ENDPOINT =
  process.env["SCANNER_WEBHOOK_URL"] || "https://hood-extend-andrews-tank.trycloudflare.com/scan";

export type ScannerJob = {
  scan_id: string;
  user_id: string;
  target_url: string;
  plan: string;
  full_name: string;
  company: string;
  email: string;
  business_email: string;
  config: ScanConfig;
  callback_url: string;
  callback_token: string;
};

/**
 * Hands a queued job to the external AI scanner. Dispatch is triggered by an
 * administrator from the admin panel. When the scan finishes the scanner posts
 * the report back to `callback_url`, where it lands in the admin panel for
 * review before it is released to the customer.
 */
export async function dispatchToScanner(job: ScannerJob): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(SCANNER_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env["SCANNER_API_KEY"] ? { authorization: `Bearer ${process.env["SCANNER_API_KEY"]}` } : {}),
      },
      body: JSON.stringify(job),
    });
    if (!res.ok) {
      const body = (await res.text().catch(() => "")).slice(0, 300);
      return { ok: false, error: `Scanner responded ${res.status}. ${body}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Scanner unreachable" };
  }
}
