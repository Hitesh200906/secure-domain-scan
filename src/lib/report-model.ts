export type Scan = {
  id: string; target_url: string; status: string; score: number | null;
  findings_count: number | null; created_at: string; plan: string;
  full_name?: string | null; company?: string | null; email?: string | null;
  role_title?: string | null; verification_method?: string | null;
  verification_status?: string | null; business_email?: string | null;
};

export const ACTIVE_KEY = "nexefy:active-report";

/* ---------- deterministic helpers (SSR-safe) ---------- */
export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}
export function seeded(seed: string, i: number) {
  return (hash(`${seed}:${i}`) % 1000) / 1000;
}

export type ReportModel = {
  id: string;
  demo: boolean;
  target: string;
  status: string;
  plan: string;
  score: number;
  findings: number;
  createdAt: string;
  requester: { name: string; email: string; company: string; role: string; verification: string; verified: string };
  posture: { label: string; value: number; color: string }[];
  trend: number[];
  threats: { ip: string; country: string; type: string; ago: string }[];
};

export const POSTURE_COLORS = ["#3B82F6", "#4F7FE8", "#22D3EE"];

export function buildReport(scan: Scan): ReportModel {
  const seed = scan.id;
  const score = scan.score ?? 55 + Math.round(seeded(seed, 99) * 40);
  const findings = scan.findings_count ?? 4 + Math.round(seeded(seed, 98) * 30);
  const types = ["Brute force", "SQL injection", "Port scan", "XSS attempt", "Credential stuffing", "Directory traversal"];
  const countries = ["RU", "CN", "US", "DE", "BR", "NL"];
  return {
    id: scan.id,
    demo: false,
    target: scan.target_url,
    status: scan.status,
    plan: scan.plan,
    score,
    findings,
    createdAt: scan.created_at,
    requester: {
      name: scan.full_name ?? "—",
      email: scan.email ?? "—",
      company: scan.company ?? "—",
      role: scan.role_title ?? "—",
      verification: scan.verification_method ?? "—",
      verified: scan.verification_status ?? "pending",
    },
    posture: [
      { label: "Application", value: Math.min(99, Math.max(35, score + Math.round(seeded(seed, 1) * 10) - 4)), color: POSTURE_COLORS[0] },
      { label: "Infrastructure", value: Math.min(99, Math.max(35, score + Math.round(seeded(seed, 2) * 12) - 8)), color: POSTURE_COLORS[1] },
      { label: "Identity", value: Math.min(99, Math.max(30, score - Math.round(seeded(seed, 3) * 16))), color: POSTURE_COLORS[2] },
    ],
    trend: Array.from({ length: 24 }, (_, i) => 30 + Math.sin(i * 0.6 + hash(seed) % 7) * 18 + seeded(seed, i) * 18),
    threats: Array.from({ length: 4 }, (_, i) => ({
      ip: `${45 + Math.round(seeded(seed, i + 10) * 180)}.${Math.round(seeded(seed, i + 20) * 250)}.${Math.round(seeded(seed, i + 30) * 250)}.${Math.round(seeded(seed, i + 40) * 250)}`,
      country: countries[Math.round(seeded(seed, i + 50) * (countries.length - 1))],
      type: types[Math.round(seeded(seed, i + 60) * (types.length - 1))],
      ago: `${2 + i * 6}m ago`,
    })),
  };
}

export const DEMO_REPORT: ReportModel = {
  ...buildReport({
    id: "demo-report", target_url: "demo.nexefy.app", status: "completed", score: 78,
    findings_count: 21, created_at: "2026-01-01T00:00:00.000Z", plan: "professional",
    full_name: "Demo User", company: "Nexefy Demo Co.", email: "demo@nexefy.app",
    role_title: "Security Lead", verification_method: "email", verification_status: "verified",
  }),
  demo: true,
};

export function scoreColor(v: number) {
  if (v >= 80) return "#22C55E";
  if (v >= 40) return "#3B82F6";
  return "#EF4444";
}

/* ------------------------- deep vulnerability model ------------------------ */
export type Severity = "Critical" | "High" | "Medium" | "Low";

export const SEVERITY_COLOR: Record<Severity, string> = {
  Critical: "#a83232",
  High: "#b5702a",
  Medium: "#9a8a2c",
  Low: "#2f7361",
};

export type Vulnerability = {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  cvss: string;
  cwe: string;
  asset: string;
  status: "Open" | "Triaged" | "Fixed";
  description: string;
  impact: string;
  evidence: string;
  remediation: string;
  references: string[];
  firstSeen: string;
};

const CATALOG: Omit<Vulnerability, "id" | "asset" | "status" | "firstSeen">[] = [
  {
    title: "Reflected Cross-Site Scripting in search parameter",
    severity: "Critical", category: "Application", cvss: "9.1", cwe: "CWE-79",
    description: "User-supplied input in the `q` query parameter is rendered into the HTML response without contextual output encoding, allowing arbitrary script execution in the victim's browser session.",
    impact: "An attacker can hijack authenticated sessions, exfiltrate access tokens from local storage, and perform actions on behalf of any user who opens a crafted link.",
    evidence: "GET /search?q=%3Cscript%3Ealert(1)%3C/script%3E → 200 OK, payload reflected verbatim inside <div class=\"results\">.",
    remediation: "Encode all untrusted output for the HTML context, prefer framework auto-escaping, and deploy a strict Content-Security-Policy without `unsafe-inline`.",
    references: ["OWASP ASVS 5.3.3", "CWE-79", "OWASP Top 10 A03:2021"],
  },
  {
    title: "SQL injection in report filtering endpoint",
    severity: "Critical", category: "Application", cvss: "9.8", cwe: "CWE-89",
    description: "The `sort` parameter is concatenated directly into a SQL ORDER BY clause, permitting boolean-based and time-based injection.",
    impact: "Full database read access, including credential hashes and customer PII; possible write access depending on database role privileges.",
    evidence: "POST /api/reports {\"sort\":\"created_at; SELECT pg_sleep(5)--\"} → response time 5.2s vs 0.2s baseline.",
    remediation: "Use parameterised queries or an allow-list of sortable columns. Run the application database role with least privilege.",
    references: ["CWE-89", "OWASP Top 10 A03:2021"],
  },
  {
    title: "Missing authorization check on object access (IDOR)",
    severity: "High", category: "Access Control", cvss: "8.2", cwe: "CWE-639",
    description: "Object identifiers are validated for existence but not for ownership, so any authenticated user can read records belonging to other tenants.",
    impact: "Cross-tenant data disclosure of invoices, scan reports and account metadata.",
    evidence: "GET /api/reports/8f21… returned a record owned by a different organisation while authenticated as a low-privilege user.",
    remediation: "Enforce ownership at the data layer (row-level security) rather than in controller code, and add regression tests per role.",
    references: ["CWE-639", "OWASP Top 10 A01:2021"],
  },
  {
    title: "Security headers missing (HSTS, CSP, X-Content-Type-Options)",
    severity: "Medium", category: "Infrastructure", cvss: "5.3", cwe: "CWE-693",
    description: "Responses omit Strict-Transport-Security, Content-Security-Policy and X-Content-Type-Options, weakening browser-side defence in depth.",
    impact: "Increases exploitability of XSS and enables SSL-stripping downgrade attacks on first visit.",
    evidence: "curl -I https://target → no `strict-transport-security`, no `content-security-policy`.",
    remediation: "Add HSTS with a minimum max-age of 31536000 and includeSubDomains, a nonce-based CSP, and `X-Content-Type-Options: nosniff` at the edge.",
    references: ["OWASP Secure Headers Project", "CWE-693"],
  },
  {
    title: "Outdated TLS configuration and weak cipher suites",
    severity: "Medium", category: "Infrastructure", cvss: "6.1", cwe: "CWE-327",
    description: "The endpoint negotiates TLS 1.0/1.1 and offers CBC-mode cipher suites without forward secrecy.",
    impact: "Traffic is susceptible to downgrade and padding-oracle style attacks on legacy clients.",
    evidence: "TLS handshake succeeded with TLS1.0 / TLS_RSA_WITH_AES_128_CBC_SHA.",
    remediation: "Restrict to TLS 1.2+ (prefer 1.3), enable only AEAD suites with ECDHE key exchange, and enable OCSP stapling.",
    references: ["NIST SP 800-52r2", "CWE-327"],
  },
  {
    title: "Session cookie missing Secure, HttpOnly and SameSite attributes",
    severity: "High", category: "Identity", cvss: "7.4", cwe: "CWE-1004",
    description: "The session cookie is issued without HttpOnly and SameSite flags, and is accepted over plaintext HTTP.",
    impact: "Session theft via injected JavaScript or network interception, and cross-site request forgery against state-changing endpoints.",
    evidence: "Set-Cookie: sid=…; Path=/ (no Secure, no HttpOnly, no SameSite)",
    remediation: "Set `Secure; HttpOnly; SameSite=Lax` (or Strict), rotate session identifiers on privilege change, and expire idle sessions.",
    references: ["CWE-1004", "OWASP ASVS 3.4"],
  },
  {
    title: "No rate limiting on authentication endpoints",
    severity: "High", category: "Identity", cvss: "7.5", cwe: "CWE-307",
    description: "Login and password-reset endpoints accept unlimited attempts from a single source without throttling, lockout, or proof of work.",
    impact: "Enables credential stuffing and password spraying at scale, and allows email-enumeration through response timing.",
    evidence: "500 sequential failed logins from one IP produced no 429 response and no lockout.",
    remediation: "Apply per-IP and per-account rate limits with exponential backoff, add CAPTCHA after repeated failures, and alert on spikes.",
    references: ["CWE-307", "OWASP Top 10 A07:2021"],
  },
  {
    title: "Sensitive data exposed in verbose error responses",
    severity: "Medium", category: "Application", cvss: "5.9", cwe: "CWE-209",
    description: "Unhandled exceptions return stack traces containing framework versions, file paths and query fragments.",
    impact: "Provides attackers with reconnaissance detail that accelerates exploitation of other weaknesses.",
    evidence: "POST /api/scan with malformed JSON returned a 500 body with a full server stack trace.",
    remediation: "Return generic error envelopes to clients, log details server-side with correlation IDs, and disable debug mode in production.",
    references: ["CWE-209", "OWASP Top 10 A05:2021"],
  },
  {
    title: "Vulnerable third-party dependencies in production bundle",
    severity: "High", category: "Supply Chain", cvss: "7.1", cwe: "CWE-1104",
    description: "Several shipped dependencies are pinned to versions with published advisories, including prototype-pollution and ReDoS issues.",
    impact: "Remote attackers can trigger denial of service or, in the worst case, manipulate object prototypes to bypass logic checks.",
    evidence: "3 direct and 6 transitive dependencies matched known advisories during SCA analysis.",
    remediation: "Upgrade the affected packages, enable automated dependency scanning in CI, and pin with a lockfile plus integrity hashes.",
    references: ["CWE-1104", "OWASP Top 10 A06:2021"],
  },
  {
    title: "Publicly listable object storage bucket",
    severity: "Critical", category: "Infrastructure", cvss: "8.6", cwe: "CWE-284",
    description: "A storage bucket used for uploaded assets permits anonymous listing and object read.",
    impact: "Unauthenticated download of user-uploaded documents and internal report exports.",
    evidence: "Anonymous GET on the bucket root returned an XML object listing with 1,284 keys.",
    remediation: "Disable public access, serve assets through signed URLs with short TTLs, and add ownership checks on the download path.",
    references: ["CWE-284", "CIS Cloud Benchmark"],
  },
  {
    title: "Missing multi-factor authentication for privileged accounts",
    severity: "Medium", category: "Identity", cvss: "6.5", cwe: "CWE-308",
    description: "Administrator accounts authenticate with a single password factor.",
    impact: "A single credential compromise grants full administrative control of the tenant.",
    evidence: "Admin sign-in flow completed with password only; no second factor challenge observed.",
    remediation: "Enforce TOTP or WebAuthn for all privileged roles and require re-authentication for destructive actions.",
    references: ["CWE-308", "NIST SP 800-63B"],
  },
  {
    title: "Directory listing and exposed source maps",
    severity: "Low", category: "Application", cvss: "3.7", cwe: "CWE-548",
    description: "Static asset directories allow index listing and production JavaScript ships with `.map` files.",
    impact: "Reveals internal module structure and unminified logic, easing targeted attacks.",
    evidence: "GET /assets/ returned a browsable index; app.js.map resolved with 200 OK.",
    remediation: "Disable autoindex, exclude source maps from production builds or restrict them to authenticated internal use.",
    references: ["CWE-548"],
  },
];

export function buildVulnerabilities(report: ReportModel): Vulnerability[] {
  const count = Math.max(6, Math.min(CATALOG.length, Math.round(report.findings / 2) + 5));
  const statuses: Vulnerability["status"][] = ["Open", "Triaged", "Fixed"];
  const paths = ["/", "/api/reports", "/login", "/api/scan", "/assets", "/account/settings"];
  return CATALOG.slice(0, count).map((v, i) => {
    const s = seeded(report.id, i + 200);
    const days = 1 + Math.round(seeded(report.id, i + 300) * 45);
    const created = new Date(new Date(report.createdAt).getTime() - days * 86400000);
    return {
      ...v,
      id: `NXF-${(hash(report.id + i) % 9000 + 1000).toString()}`,
      asset: `${report.target}${paths[i % paths.length]}`,
      status: v.severity === "Critical" ? "Open" : statuses[Math.round(s * 2)],
      firstSeen: created.toISOString(),
    };
  });
}

export function severityBreakdown(vulns: Vulnerability[]) {
  const order: Severity[] = ["Critical", "High", "Medium", "Low"];
  return order.map((sev) => ({
    severity: sev,
    color: SEVERITY_COLOR[sev],
    count: vulns.filter((v) => v.severity === sev).length,
  }));
}
