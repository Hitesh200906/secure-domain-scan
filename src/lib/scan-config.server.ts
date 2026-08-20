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
};

/**
 * Hands the queued job to the external AI scanner. The scanner posts the
 * finished report back to /api/public/scanner-report, which files it under the
 * requesting user automatically — no admin approval in the loop.
 */
export async function dispatchToScanner(job: ScannerJob): Promise<boolean> {
  const url = process.env["SCANNER_WEBHOOK_URL"];
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env["SCANNER_API_KEY"] ? { authorization: `Bearer ${process.env["SCANNER_API_KEY"]}` } : {}),
      },
      body: JSON.stringify(job),
    });
    return res.ok;
  } catch {
    return false;
  }
}
