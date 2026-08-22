import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  SCAN_DEPTHS,
  SCAN_RATES,
  TECHNOLOGIES,
  TECH_LABELS,
  type ScanConfig,
} from "@/lib/scan-config.schemas";
import { getVerifiedScan, submitScanConfiguration } from "@/lib/scan-config.functions";

const SCANNER_IP = "203.0.113.42";

export const Route = createFileRoute("/_authenticated/scan/configure")({
  validateSearch: (s: Record<string, unknown>): { id: string } => ({ id: String(s.id ?? "") }),
  head: () => ({
    meta: [
      { title: "Configure Your Security Scan — Nexefy Security" },
      { name: "description", content: "Set the technical configuration our AI scanner uses to assess your verified website." },
      { property: "og:title", content: "Configure Your Security Scan — Nexefy Security" },
      { property: "og:description", content: "Set the technical configuration our AI scanner uses to assess your verified website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanConfigurePage,
});

type Step = "config" | "review";

const STEPS = ["Details", "Domain Verified", "Scan Configuration", "Review", "Scan"];

function ScanConfigurePage() {
  const { id } = useSearch({ from: "/_authenticated/scan/configure" });
  const navigate = useNavigate();
  const loadScan = useServerFn(getVerifiedScan);
  const submitConfig = useServerFn(submitScanConfiguration);

  const [scan, setScan] = useState<{ target_url: string; plan: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("config");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [cfg, setCfg] = useState<Omit<ScanConfig, "authorization_confirmed">>({
    authentication: "public",
    secure_session_requested: false,
    waf: "none",
    technology: "not_sure",
    ai_validation: true,
    scan_rate: "medium",
    scan_depth: "standard",
    advanced: {
      respect_robots: true,
      include_subdomains: false,
      include_api_endpoints: true,
      max_crawl_depth: 3,
      request_timeout: 20,
      excluded_urls: "",
    },
  });

  useEffect(() => {
    if (!id) {
      setLoadError("No scan request was provided.");
      return;
    }
    loadScan({ data: { scan_id: id } })
      .then((s) => {
        if (s.verification_status !== "verified") {
          setLoadError("Domain ownership for this request is not verified yet.");
          return;
        }
        if (s.config_submitted) {
          setLoadError("This scan request has already been configured and queued.");
          return;
        }
        setScan({ target_url: s.target_url, plan: s.plan });
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Could not load this request"));
  }, [id, loadScan]);

  const host = useMemo(() => {
    try {
      return new URL(scan?.target_url ?? "").host;
    } catch {
      return scan?.target_url ?? "";
    }
  }, [scan]);

  const start = async () => {
    if (!confirmed) return;
    setBusy(true);
    try {
      await submitConfig({ data: { scan_id: id, config: { ...cfg, authorization_confirmed: true } } });
      toast.success("Scan request submitted — our scanner is on it");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit scan request");
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-black px-5 py-24">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0a0a0c] p-8 text-center">
          <p className="text-sm text-white/70">{loadError}</p>
          <button onClick={() => navigate({ to: "/dashboard" })} className="mt-5 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm text-white transition hover:bg-[#1D4ED8]">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="grid min-h-screen place-items-center bg-black">
        <Loader2 className="size-6 animate-spin text-white/50" />
      </div>
    );
  }

  const summaryRows: Array<[string, string]> = [
    ["Target Website", host],
    ["Authentication", cfg.authentication === "public" ? "Public" : "Login Required"],
    ["WAF", cfg.waf === "none" ? "None" : "Cloudflare / Other WAF"],
    ["Technology", TECH_LABELS[cfg.technology]],
    ["Scan Rate", cap(cfg.scan_rate)],
    ["AI Validation", cfg.ai_validation ? "Enabled" : "Disabled"],
    ["Scan Depth", cap(cfg.scan_depth)],
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <ProgressBar current={step === "config" ? 2 : 3} />

        {step === "config" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h1 className="mt-8 text-[26px] font-normal tracking-tight text-white sm:text-[32px]">Configure Your Security Scan</h1>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted-foreground">
              Help our AI understand your website so we can perform a more accurate and controlled security assessment.
            </p>

            <div className="mt-10 space-y-12">
              {/* 1 — Authentication */}
              <Section title="Does your website require login?" desc="Tell us whether some areas of your website are only accessible to authenticated users.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Choice
                    selected={cfg.authentication === "public"}
                    onClick={() => setCfg({ ...cfg, authentication: "public", secure_session_requested: false })}
                    title="Public Website"
                    desc="The website can be accessed without signing in."
                  />
                  <Choice
                    selected={cfg.authentication === "login_required"}
                    onClick={() => setCfg({ ...cfg, authentication: "login_required" })}
                    title="Login Required"
                    desc="Some pages, dashboards, profiles, or application features require authentication."
                  />
                </div>
                {cfg.authentication === "login_required" && (
                  <Notice title="Secure Authentication" desc="Some authenticated areas may require a secure test session so our scanner can analyze pages that are not publicly accessible.">
                    <button
                      type="button"
                      onClick={() => {
                        setCfg({ ...cfg, secure_session_requested: true });
                        toast.success("Our team will contact you to set up a secure test session.");
                      }}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                    >
                      {cfg.secure_session_requested ? <Check className="size-3.5" /> : null}
                      Set Up Secure Test Session
                    </button>
                  </Notice>
                )}
              </Section>

              {/* 2 — WAF */}
              <Section title="Is your website protected by Cloudflare or another WAF?" desc="This helps our scanner understand whether additional traffic controls may affect the assessment.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Choice selected={cfg.waf === "none"} onClick={() => setCfg({ ...cfg, waf: "none" })} title="No WAF" desc="No known web application firewall is protecting the website." />
                  <Choice selected={cfg.waf === "waf"} onClick={() => setCfg({ ...cfg, waf: "waf" })} title="Cloudflare / WAF" desc="The website uses Cloudflare or another traffic protection layer." />
                </div>
                {cfg.waf === "waf" && (
                  <Notice title="Scanner Access" desc="Your WAF may restrict automated testing traffic. If required, allow authorized scanner traffic before starting the scan.">
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <code className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 font-mono text-[13px] text-white">{SCANNER_IP}</code>
                      <button
                        type="button"
                        onClick={() => { void navigator.clipboard.writeText(SCANNER_IP); toast.success("Scanner IP copied"); }}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-3.5 py-2 text-[12.5px] text-white/80 transition hover:text-white"
                      >
                        <Copy className="size-3.5" /> Copy Scanner IP
                      </button>
                    </div>
                  </Notice>
                )}
              </Section>

              {/* 3 — Technology */}
              <Section title="What technology does your website use?" desc="Select the technology that best describes your website. This helps our AI choose the appropriate analysis strategy.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {TECHNOLOGIES.map((t) => (
                    <Choice key={t} selected={cfg.technology === t} onClick={() => setCfg({ ...cfg, technology: t })} title={TECH_LABELS[t]} desc={TECH_DESC[t]} compact />
                  ))}
                </div>
              </Section>

              {/* 4 — Scan behaviour */}
              <Section title="Scan behaviour" desc="Choose how quickly and how deeply our scanner should work through your website.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Pills label="Scan Rate" options={SCAN_RATES} value={cfg.scan_rate} onChange={(v) => setCfg({ ...cfg, scan_rate: v })} />
                  <Pills label="Scan Depth" options={SCAN_DEPTHS} value={cfg.scan_depth} onChange={(v) => setCfg({ ...cfg, scan_depth: v })} />
                </div>
              </Section>

              {/* 5 — AI validation */}
              <Section title="AI Finding Validation" desc="Our AI reviews discovered findings and helps identify false positives, prioritize risks, and provide clearer explanations.">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#08080a] px-5 py-4">
                  <div>
                    <div className="text-[14px] text-white">Enable AI Validation</div>
                    <p className="mt-1 text-[12px] text-muted-foreground">AI validation may increase processing time but provides an additional analysis layer.</p>
                  </div>
                  <Toggle on={cfg.ai_validation} onChange={(v) => setCfg({ ...cfg, ai_validation: v })} />
                </div>
              </Section>

              {/* 6 — Advanced */}
              <div className="rounded-2xl border border-white/10 bg-[#08080a]">
                <button type="button" onClick={() => setAdvancedOpen((v) => !v)} className="flex w-full items-center justify-between px-5 py-4 text-left">
                  <span className="text-[14px] text-white">Advanced Settings</span>
                  <ChevronDown className={`size-4 text-white/50 transition ${advancedOpen ? "rotate-180" : ""}`} />
                </button>
                {advancedOpen && (
                  <div className="space-y-4 border-t border-white/8 px-5 py-5">
                    <Switch label="Respect robots.txt" on={cfg.advanced.respect_robots} onChange={(v) => setAdv({ respect_robots: v })} />
                    <Switch label="Include discovered subdomains" on={cfg.advanced.include_subdomains} onChange={(v) => setAdv({ include_subdomains: v })} />
                    <Switch label="Include API endpoints" on={cfg.advanced.include_api_endpoints} onChange={(v) => setAdv({ include_api_endpoints: v })} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <NumberField label="Maximum crawl depth" value={cfg.advanced.max_crawl_depth} min={1} max={10} onChange={(v) => setAdv({ max_crawl_depth: v })} />
                      <NumberField label="Request timeout (seconds)" value={cfg.advanced.request_timeout} min={5} max={120} onChange={(v) => setAdv({ request_timeout: v })} />
                    </div>
                    <label className="block">
                      <span className="mb-2 block text-[13px] text-white/85">Custom URL exclusions</span>
                      <textarea
                        rows={3}
                        value={cfg.advanced.excluded_urls}
                        onChange={(e) => setAdv({ excluded_urls: e.target.value.slice(0, 2000) })}
                        placeholder="/admin&#10;/checkout"
                        className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-white/10 bg-[#08080a] p-5">
                <div className="text-[14px] text-white">Scan Configuration</div>
                <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {summaryRows.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-white/5 pb-2">
                      <dt className="text-[12px] text-muted-foreground">{k}</dt>
                      <dd className="text-[12.5px] text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={() => navigate({ to: "/dashboard" })} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 px-6 py-3.5 text-[14px] text-white/80 transition hover:text-white sm:w-40">
                  <ArrowLeft className="size-4" /> Back
                </button>
                <button type="button" onClick={() => setStep("review")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-6 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1D4ED8]">
                  Continue to Review <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h1 className="mt-8 text-[26px] font-normal tracking-tight text-white sm:text-[32px]">Review Your Scan</h1>
            <p className="mt-2 text-[13.5px] text-muted-foreground">Review your scan configuration before starting the security assessment.</p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#08080a] p-6">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[...summaryRows, ["Plan", scan?.plan ? cap(scan.plan) : "—"] as [string, string]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <dt className="text-[12px] text-muted-foreground">{k}</dt>
                    <dd className="text-[13px] text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#08080a] p-6">
              <div className="text-[14px] text-white">Authorization Confirmation</div>
              <label className="mt-3 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 size-4 accent-[#2563EB]"
                />
                <span className="text-[12.5px] leading-relaxed text-muted-foreground">
                  I confirm that I am authorized to request a security scan of this website and understand that the scan will
                  generate network traffic against the target.
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={() => setStep("config")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 px-6 py-3.5 text-[14px] text-white/80 transition hover:text-white sm:w-52">
                <ArrowLeft className="size-4" /> Edit Configuration
              </button>
              <button
                type="button"
                disabled={!confirmed || busy}
                onClick={start}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-6 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Start Security Scan
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  function setAdv(patch: Partial<ScanConfig["advanced"]>) {
    setCfg((c) => ({ ...c, advanced: { ...c.advanced, ...patch } }));
  }
}

const TECH_DESC: Record<(typeof TECHNOLOGIES)[number], string> = {
  wordpress_php: "Traditional server-rendered websites and WordPress applications.",
  spa_frontend: "Modern frontend or Single Page Applications.",
  node_express: "Node.js applications and APIs.",
  python: "Python-based web applications.",
  java_spring: "Java and Spring applications.",
  dotnet: "Microsoft .NET applications.",
  not_sure: "Let our scanner detect the technology automatically.",
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function estTime(depth: string, rate: string) {
  const base = depth === "shallow" ? 10 : depth === "deep" ? 45 : 25;
  const mult = rate === "slow" ? 1.6 : rate === "fast" ? 0.7 : 1;
  return `~${Math.round(base * mult)} minutes`;
}

function estCredits(depth: string, ai: boolean) {
  const base = depth === "shallow" ? 40 : depth === "deep" ? 180 : 100;
  return base + (ai ? 20 : 0);
}

function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <span
            className={`text-[11px] uppercase tracking-[0.16em] ${
              i < current ? "text-white/45" : i === current ? "text-white" : "text-white/25"
            }`}
          >
            {s}
          </span>
          {i < STEPS.length - 1 && <span className="text-white/15">→</span>}
        </div>
      ))}
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[17px] text-white">{title}</h2>
      <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Choice({
  selected, onClick, title, desc, compact,
}: { selected: boolean; onClick: () => void; title: string; desc: string; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-2xl border p-4 text-left transition ${
        selected ? "border-[#2563EB] bg-[#2563EB]/10" : "border-white/10 bg-[#08080a] hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] text-white">{title}</span>
        {selected && <Check className="size-4 shrink-0 text-[#60A5FA]" />}
      </div>
      <p className={`mt-1.5 text-[12px] leading-relaxed text-muted-foreground ${compact ? "line-clamp-2" : ""}`}>{desc}</p>
    </button>
  );
}

function Notice({ title, desc, children }: { title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-[#08080a] p-5">
      <div className="text-[13.5px] text-white">{title}</div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{desc}</p>
      {children}
    </div>
  );
}

function Pills<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div>
      <div className="mb-2 text-[13px] text-white/85">{label}</div>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-[12.5px] transition ${
              value === o ? "border-[#2563EB] bg-[#2563EB]/10 text-white" : "border-white/10 text-white/60 hover:text-white"
            }`}
          >
            {cap(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[#2563EB]" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Switch({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-white/85">{label}</span>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] text-white/85">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-[13px] text-white focus:outline-none"
      />
    </label>
  );
}
