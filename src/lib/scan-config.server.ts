import type { ScanConfig } from "@/lib/scan-config.schemas";

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

/** Default AI scanner endpoint; override with SCANNER_WEBHOOK_URL. */
const DEFAULT_SCANNER_URL = "https://hood-extend-andrews-tank.trycloudflare.com/scan";

/**
 * Hands a submitted scan form to the external AI scanner. The scanner posts
 * the finished report back to the callback URL, where it lands in the admin
 * panel for release to the customer.
 */
export async function dispatchToScanner(job: ScannerJob): Promise<{ ok: boolean; error?: string }> {
  const url = process.env["SCANNER_WEBHOOK_URL"] || DEFAULT_SCANNER_URL;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-scanner-token": job.callback_token,
        ...(process.env["SCANNER_API_KEY"] ? { authorization: `Bearer ${process.env["SCANNER_API_KEY"]}` } : {}),
      },
      body: JSON.stringify(job),
    });
    if (!res.ok) return { ok: false, error: `Scanner responded ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}
