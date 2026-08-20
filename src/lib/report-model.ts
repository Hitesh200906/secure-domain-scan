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

/* ------------------------------ severities ------------------------------- */
export type Severity = "Critical" | "High" | "Medium" | "Low";

export const SEVERITY_COLOR: Record<Severity, string> = {
  Critical: "#EF4444",
  High: "#F97316",
  Medium: "#EAB308",
  Low: "#60A5FA",
};

/* ------------------------- scanner finding record ------------------------- */
export type ScanFinding = {
  title: string;
  severity: Severity;
  url: string;
  parameter: string;
  payload: string;
  evidence: string;
  remediation: string;
  cwe: string;
  owasp: string;
  category: string;
  cvss: string;
  description: string;
  impact: string;
  aiValidation: string;
  aiReasoning: string;
  reproduction: string;
};

/** Findings extracted from the Ultimate Scanner v8.0 report structure. */
export const DEMO_FINDINGS: ScanFinding[] = [
  {
    title: "SQL Injection - Authentication Bypass",
    severity: "Critical",
    url: "http://demo.testfire.net/login.jsp",
    parameter: "username",
    payload: "' OR '1'='1",
    evidence: "Login bypassed: ' OR '1'='1",
    remediation: "Use parameterized queries",
    cwe: "CWE-89",
    owasp: "A03:2021 - Injection",
    category: "Application",
    cvss: "9.8",
    description:
      "The username field of the login form is concatenated directly into the authentication SQL statement. Submitting a tautology payload makes the WHERE clause always evaluate true, so the application authenticates the request without valid credentials.",
    impact:
      "An unauthenticated attacker gains an authenticated session without knowing any credentials, and the same injection point can be extended to read or modify arbitrary database records.",
    aiValidation: "Confirmed — exploit reproduced by the scanner",
    aiReasoning: "N/A",
    reproduction: "N/A",
  },
  {
    title: "Default Credentials",
    severity: "Critical",
    url: "http://demo.testfire.net/login.jsp",
    parameter: "username",
    payload: "admin:admin",
    evidence: "Login successful: admin/admin",
    remediation: "Change default credentials",
    cwe: "CWE-798",
    owasp: "A07:2021 - Authentication Failures",
    category: "Identity",
    cvss: "9.1",
    description:
      "The application still accepts a shipped administrative account with the vendor default password. The scanner authenticated successfully using admin/admin.",
    impact:
      "Complete administrative takeover of the application, including access to every user account and any administrative function exposed by the console.",
    aiValidation: "Confirmed — successful authenticated session",
    aiReasoning: "N/A",
    reproduction: "N/A",
  },
  {
    title: "Cross-Site Scripting (Reflected - html_context)",
    severity: "High",
    url: "http://demo.testfire.net/index.jsp",
    parameter: "content",
    payload: "<details open ontoggle=alert(1)>",
    evidence: "Payload reflected unencoded in html_context.",
    remediation: "Implement context-aware output encoding and Content Security Policy (CSP).",
    cwe: "CWE-79",
    owasp: "A03:2021 - Injection",
    category: "Application",
    cvss: "7.4",
    description:
      "The `content` parameter is echoed back into the HTML body without contextual output encoding, so injected markup with an event handler executes in the visitor's browser.",
    impact:
      "Session hijacking, credential harvesting through injected forms, and arbitrary actions performed in the context of any user who follows a crafted link.",
    aiValidation: "Confirmed — payload reflected verbatim",
    aiReasoning: "N/A",
    reproduction: "N/A",
  },
  {
    title: "Cross-Site Scripting (Reflected - html_context)",
    severity: "High",
    url: "http://demo.testfire.net/search.jsp",
    parameter: "query",
    payload: "<script>alert(1)</script>",
    evidence: "Payload reflected unencoded in html_context.",
    remediation: "Implement context-aware output encoding and Content Security Policy (CSP).",
    cwe: "CWE-79",
    owasp: "A03:2021 - Injection",
    category: "Application",
    cvss: "7.2",
    description:
      "Search terms submitted through the `query` parameter are rendered into the results page without encoding, allowing a raw script tag to execute.",
    impact:
      "Attackers can run arbitrary JavaScript in a victim's session, exfiltrate tokens, and pivot to account takeover.",
    aiValidation: "Confirmed — script tag executed in html context",
    aiReasoning: "N/A",
    reproduction: "N/A",
  },
];

/* --------------------------- generic catalog ------------------------------ */
const CATALOG: ScanFinding[] = [
  ...DEMO_FINDINGS,
  {
    title: "Missing authorization check on object access (IDOR)",
    severity: "High", url: "/api/reports/{id}", parameter: "id", payload: "id=8f21…",
    evidence: "GET /api/reports/8f21… returned a record owned by a different organisation.",
    remediation: "Enforce ownership at the data layer (row-level security) and add per-role regression tests.",
    cwe: "CWE-639", owasp: "A01:2021 - Broken Access Control", category: "Access Control", cvss: "8.2",
    description: "Object identifiers are validated for existence but not ownership, so any authenticated user can read other tenants' records.",
    impact: "Cross-tenant disclosure of invoices, scan reports and account metadata.",
    aiValidation: "Confirmed", aiReasoning: "N/A", reproduction: "N/A",
  },
  {
    title: "Security headers missing (HSTS, CSP, X-Content-Type-Options)",
    severity: "Medium", url: "/", parameter: "response headers", payload: "curl -I",
    evidence: "No `strict-transport-security`, no `content-security-policy` in response headers.",
    remediation: "Add HSTS (max-age 31536000, includeSubDomains), a nonce-based CSP and `X-Content-Type-Options: nosniff`.",
    cwe: "CWE-693", owasp: "A05:2021 - Security Misconfiguration", category: "Infrastructure", cvss: "5.3",
    description: "Responses omit key browser-side hardening headers.",
    impact: "Increases exploitability of XSS and enables SSL-stripping on first visit.",
    aiValidation: "Confirmed", aiReasoning: "N/A", reproduction: "N/A",
  },
  {
    title: "Session cookie missing Secure, HttpOnly and SameSite",
    severity: "High", url: "/login", parameter: "Set-Cookie", payload: "sid=…; Path=/",
    evidence: "Set-Cookie: sid=…; Path=/ (no Secure, no HttpOnly, no SameSite)",
    remediation: "Set `Secure; HttpOnly; SameSite=Lax`, rotate session IDs on privilege change and expire idle sessions.",
    cwe: "CWE-1004", owasp: "A05:2021 - Security Misconfiguration", category: "Identity", cvss: "7.4",
    description: "The session cookie is issued without protective attributes and is accepted over plaintext HTTP.",
    impact: "Session theft via injected JavaScript or network interception, plus CSRF against state-changing endpoints.",
    aiValidation: "Confirmed", aiReasoning: "N/A", reproduction: "N/A",
  },
  {
    title: "No rate limiting on authentication endpoints",
    severity: "Medium", url: "/login", parameter: "password", payload: "500 sequential attempts",
    evidence: "500 failed logins from a single IP produced no 429 and no lockout.",
    remediation: "Apply per-IP and per-account throttling with exponential backoff and alerting.",
    cwe: "CWE-307", owasp: "A07:2021 - Authentication Failures", category: "Identity", cvss: "6.5",
    description: "Login and password-reset endpoints accept unlimited attempts without throttling.",
    impact: "Enables credential stuffing and password spraying at scale.",
    aiValidation: "Confirmed", aiReasoning: "N/A", reproduction: "N/A",
  },
  {
    title: "Directory listing and exposed source maps",
    severity: "Low", url: "/assets/", parameter: "path", payload: "GET /assets/",
    evidence: "GET /assets/ returned a browsable index; app.js.map resolved 200 OK.",
    remediation: "Disable autoindex and exclude source maps from production builds.",
    cwe: "CWE-548", owasp: "A05:2021 - Security Misconfiguration", category: "Application", cvss: "3.7",
    description: "Static asset directories allow index listing and ship `.map` files.",
    impact: "Reveals internal module structure and unminified logic.",
    aiValidation: "Confirmed", aiReasoning: "N/A", reproduction: "N/A",
  },
];

/* -------------------------------- report --------------------------------- */
export type ReportModel = {
  id: string;
  demo: boolean;
  scanner: string;
  target: string;
  status: string;
  plan: string;
  score: number;
  findings: number;
  duration: string;
  pagesCrawled: number;
  endpointsTested: number;
  createdAt: string;
  requester: { name: string; email: string; company: string; role: string; verification: string; verified: string };
  posture: { label: string; value: number; color: string }[];
  trend: number[];
  findingsList: ScanFinding[];
};

export const POSTURE_COLORS = ["#3B82F6", "#4F7FE8", "#22D3EE"];

export function scoreFromFindings(list: ScanFinding[]) {
  const w: Record<Severity, number> = { Critical: 15, High: 8, Medium: 4, Low: 1 };
  return Math.max(5, 100 - list.reduce((s, f) => s + w[f.severity], 0));
}

export function buildReport(scan: Scan): ReportModel {
  const seed = scan.id;
  const count = Math.max(4, Math.min(CATALOG.length, scan.findings_count ?? 4 + Math.round(seeded(seed, 98) * 5)));
  const findingsList = CATALOG.slice(0, count).map((f) => ({
    ...f,
    url: f.url.startsWith("http") ? f.url : `${scan.target_url.replace(/\/$/, "")}${f.url}`,
  }));
  const score = scan.score ?? scoreFromFindings(findingsList);
  return {
    id: scan.id,
    demo: false,
    scanner: "Ultimate Scanner v8.0",
    target: scan.target_url,
    status: scan.status,
    plan: scan.plan,
    score,
    findings: findingsList.length,
    duration: `${(90 + seeded(seed, 7) * 90).toFixed(1)}s`,
    pagesCrawled: 6 + Math.round(seeded(seed, 5) * 20),
    endpointsTested: 18 + Math.round(seeded(seed, 6) * 40),
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
      { label: "Application", value: Math.min(99, Math.max(20, score - 6)), color: POSTURE_COLORS[0] },
      { label: "Infrastructure", value: Math.min(99, Math.max(25, score + 12)), color: POSTURE_COLORS[1] },
      { label: "Identity", value: Math.min(99, Math.max(15, score - 14)), color: POSTURE_COLORS[2] },
    ],
    trend: Array.from({ length: 24 }, (_, i) => 30 + Math.sin(i * 0.6 + hash(seed) % 7) * 18 + seeded(seed, i) * 18),
    findingsList,
  };
}

export const DEMO_REPORT: ReportModel = {
  ...buildReport({
    id: "ffa093bf-4815-4036-82a4-ee812de60720",
    target_url: "http://demo.testfire.net",
    status: "completed",
    score: scoreFromFindings(DEMO_FINDINGS),
    findings_count: DEMO_FINDINGS.length,
    created_at: "2026-01-01T00:00:00.000Z",
    plan: "professional",
    full_name: "Demo User", company: "Nexefy Demo Co.", email: "demo@nexefy.app",
    role_title: "Security Lead", verification_method: "email", verification_status: "verified",
  }),
  demo: true,
  duration: "136.7s",
  pagesCrawled: 11,
  endpointsTested: 31,
  findings: DEMO_FINDINGS.length,
  findingsList: DEMO_FINDINGS,
};

export function scoreColor(v: number) {
  if (v >= 80) return "#22C55E";
  if (v >= 40) return "#3B82F6";
  return "#EF4444";
}

/* ------------------------- deep vulnerability model ------------------------ */
export type Vulnerability = ScanFinding & {
  id: string;
  asset: string;
  status: "Open" | "Triaged" | "Fixed";
  firstSeen: string;
  references: string[];
};

export function buildVulnerabilities(report: ReportModel): Vulnerability[] {
  return report.findingsList.map((v, i) => {
    const s = seeded(report.id, i + 200);
    const days = 1 + Math.round(seeded(report.id, i + 300) * 20);
    const created = new Date(new Date(report.createdAt).getTime() - days * 86400000);
    const statuses: Vulnerability["status"][] = ["Open", "Triaged", "Open"];
    return {
      ...v,
      id: `NXF-${(hash(report.id + i) % 9000 + 1000).toString()}`,
      asset: v.url,
      status: v.severity === "Critical" ? "Open" : statuses[Math.round(s * 2)],
      firstSeen: created.toISOString(),
      references: [v.cwe, v.owasp],
    };
  });
}

export function severityBreakdown(vulns: { severity: Severity }[]) {
  const order: Severity[] = ["Critical", "High", "Medium", "Low"];
  return order.map((sev) => ({
    severity: sev,
    color: SEVERITY_COLOR[sev],
    count: vulns.filter((v) => v.severity === sev).length,
  }));
}
