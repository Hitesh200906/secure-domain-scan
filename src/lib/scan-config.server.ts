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

/** Default AI scanner endpoint; override with SCANNER_API_URL. */
const DEFAULT_SCANNER_BASE = "https://scanner-api-psi.vercel.app";

function scannerBase() {
  return (process.env["SCANNER_API_URL"] || DEFAULT_SCANNER_BASE).replace(/\/+$/, "");
}

function authHeaders(): Record<string, string> {
  const key = process.env["SCANNER_API_KEY"];
  return key ? { authorization: `Bearer ${key}` } : {};
}

/** Depth setting → how many pages the scanner should crawl. */
function maxPagesFor(config: ScanConfig | undefined): number {
  switch (config?.scan_depth) {
    case "shallow": return 10;
    case "deep": return 100;
    default: return 25;
  }
}

/**
 * Hands a submitted scan form to the external AI scanner (FastAPI service).
 * The scanner queues the job and returns its own scan id, which we store so
 * the admin panel can poll for status and pull the finished report.
 */
export async function dispatchToScanner(
  job: ScannerJob,
): Promise<{ ok: boolean; error?: string; externalId?: string }> {
  try {
    const res = await fetch(`${scannerBase()}/api/scan`, {
      method: "POST",
      headers: { "content-type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        target: job.target_url,
        max_pages: maxPagesFor(job.config),
        cookies: null,
        user_email: job.business_email || job.email || null,
      }),
    });
    const body = (await res.json().catch(() => null)) as { scan_id?: string; detail?: unknown } | null;
    if (!res.ok) return { ok: false, error: `Scanner responded ${res.status}` };
    if (!body?.scan_id) return { ok: false, error: "Scanner did not return a scan id" };
    return { ok: true, externalId: String(body.scan_id) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export type ScannerStatus = {
  ok: boolean;
  error?: string;
  status?: string;
  results?: unknown;
};

/** Polls the scanner for job status and, once finished, its results. */
export async function fetchScannerResults(externalId: string): Promise<ScannerStatus> {
  try {
    const base = scannerBase();
    const sres = await fetch(`${base}/api/scan/${encodeURIComponent(externalId)}/status`, {
      headers: authHeaders(),
    });
    if (!sres.ok) return { ok: false, error: `Scanner status ${sres.status}` };
    const sbody = (await sres.json().catch(() => ({}))) as Record<string, unknown>;
    const status = String(sbody["status"] ?? "pending");
    if (status !== "completed" && status !== "complete" && status !== "done") {
      return { ok: true, status };
    }
    const rres = await fetch(`${base}/api/scan/${encodeURIComponent(externalId)}/results`, {
      headers: authHeaders(),
    });
    if (!rres.ok) return { ok: false, error: `Scanner results ${rres.status}` };
    const results = await rres.json().catch(() => null);
    return { ok: true, status: "completed", results };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

