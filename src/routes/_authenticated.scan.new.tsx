import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, Loader2, Lock, Crosshair, ChevronDown, ChevronRight, Copy, ShieldCheck, X,
  User, Briefcase, Building2, Mail, AtSign, Link2, Info,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import icIdCard from "@/assets/scanform-icon-idcard.png";
import icGlobe from "@/assets/scanform-icon-globe.png";
import icShield from "@/assets/scanform-icon-shield.png";
import scanConfigBg from "@/assets/scan-config-bg.png.asset.json";
import {
  startEmailVerification,
  confirmEmailVerification,
  startManualVerification,
  confirmManualVerification,
} from "@/lib/scan-verification.functions";

type Flow =
  | null
  | { kind: "email"; scanId: string; sentTo: string; hint: string | null }
  | { kind: "manual"; scanId: string; code: string; token: string };

type Plan = "starter" | "professional" | "enterprise";

const PLAN_INFO: Record<Plan, { name: string; credits: number }> = {
  starter: { name: "Starter", credits: 1 },
  professional: { name: "Professional", credits: 15 },
  enterprise: { name: "Enterprise", credits: 999 },
};

const ROLES = [
  "Security Engineer",
  "Founder / CEO",
  "CTO",
  "Developer",
  "IT Manager",
  "Compliance Officer",
  "Other",
];

export const Route = createFileRoute("/_authenticated/scan/new")({
  validateSearch: (s: Record<string, unknown>): { plan: Plan } => {
    const p = String(s.plan ?? "professional");
    const plan: Plan = p === "starter" || p === "enterprise" ? p : "professional";
    return { plan };
  },
  head: () => ({
    meta: [
      { title: "New Scan — Nexefy Security" },
      { name: "description", content: "Submit a new AI-powered website security scan: your details, target URL, and domain ownership verification." },
      { property: "og:title", content: "New Scan — Nexefy Security" },
      { property: "og:description", content: "Submit a new AI-powered website security scan request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanNewPage,
});

function ScanNewPage() {
  const { plan } = useSearch({ from: "/_authenticated/scan/new" }) as { plan: Plan };
  const { user } = useAuth();
  const navigate = useNavigate();
  const info = PLAN_INFO[plan];

  const [form, setForm] = useState({
    full_name: "",
    role_title: "Security Engineer",
    company: "",
    email: "",
    target_url: "",
    business_email: "",
  });
  const [verification, setVerification] = useState<"email" | "manual">("email");
  const [loading, setLoading] = useState(false);
  const [flow, setFlow] = useState<Flow>(null);

  const startEmail = useServerFn(startEmailVerification);
  const confirmEmail = useServerFn(confirmEmailVerification);
  const startManual = useServerFn(startManualVerification);
  const confirmManual = useServerFn(confirmManualVerification);

  useEffect(() => {
    if (user?.email) setForm((f) => ({ ...f, email: f.email || user.email! }));
  }, [user]);

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (verification === "email" && !form.business_email.trim()) {
      toast.error("Enter your business email to receive the verification code");
      return;
    }
    setLoading(true);
    try {
      const { scan } = await api.createScan({
        full_name: form.full_name,
        role_title: form.role_title,
        company: form.company,
        email: form.email,
        target_url: form.target_url,
        business_email: form.business_email,
        plan,
        verification_method: verification,
        status: "awaiting_verification",
      } as never);
      const scanId = (scan as { id: string }).id;

      if (verification === "email") {
        const res = await startEmail({ data: { scan_id: scanId } });
        if (!res.ok) {
          toast.error(res.message);
          return;
        }
        setFlow({ kind: "email", scanId, sentTo: res.sent_to, hint: res.delivered ? null : res.code });
      } else {
        const res = await startManual({ data: { scan_id: scanId } });
        setFlow({ kind: "manual", scanId, code: res.code, token: res.token });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
              else navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-white/[0.08] hover:text-white"
          >
            ← Back
          </button>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {info.name} · {info.credits} credits
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-14">
          {/* Your Information */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <SectionHead
              img={icIdCard}
              alt="Contact card icon"
              title="Your Information"
              desc="Provide your details so we can process your scan request."
            />
            <div className="mt-8 grid sm:grid-cols-2 gap-x-7 gap-y-6">
              <Field label="Full Name" icon={<User className="size-[18px]" />} value={form.full_name}
                onChange={update("full_name")} placeholder="Enter your full name" required />
              <SelectField label="Role" icon={<Briefcase className="size-[18px]" />} value={form.role_title}
                onChange={update("role_title")} options={ROLES} />
              <Field label="Company Name" icon={<Building2 className="size-[18px]" />} value={form.company}
                onChange={update("company")} placeholder="Enter company name" />
              <Field label="Your Email" type="email" icon={<Mail className="size-[18px]" />} value={form.email}
                onChange={update("email")} placeholder="Enter your email" required />
              <div className="sm:col-span-2">
                <Field label="Business Email" type="email" icon={<AtSign className="size-[18px]" />}
                  value={form.business_email} onChange={update("business_email")} placeholder="Enter your business email" />
                <p className="mt-2 text-[11.5px] text-white/45">
                  This address must be published on your website — on the contact page or in the footer — so our AI can confirm it before sending your code.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Scan Configuration */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="relative isolate">
            {/* Background artwork — scoped to the right side of this section only */}
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-[65%] z-0 overflow-hidden rounded-3xl">
              <img
                src={scanConfigBg.url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[right_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
            </div>
            <div className="relative z-10">
              <SectionHead
                img={icGlobe}
                alt="Globe icon"
                title="Scan Configuration"
                desc="Configure the website you want us to analyze."
              />
              <div className="mt-8">
                <div className="text-[15px] text-white">Target Website URL</div>
                <p className="mt-1 text-[13px] text-muted-foreground">Please provide the website you want us to scan.</p>
                <div className="mt-4 w-[40%] min-w-0">
                  <Field label="" type="url" icon={<Link2 className="size-[18px]" />} value={form.target_url}
                    onChange={update("target_url")} placeholder="https://example.com" required />
                </div>
              </div>
            </div>
          </motion.section>



          {/* Domain Ownership Verification */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <SectionHead
              img={icShield}
              alt="Shield with padlock icon"
              title="Domain Ownership Verification"
              desc="Choose a method to verify that you own the domain."
            />
            <div className="mt-6 grid sm:grid-cols-2 gap-5">
              <VerifCard
                selected={verification === "email"}
                onClick={() => setVerification("email")}
                badge="Recommended"
                title="Email Verification"
                desc="Our AI scans your website for your business email. If it is published there, we send a six-digit code to it."
                steps={[
                  "AI reads your site for the business email",
                  "Six-digit code sent to that address",
                  "Enter the code to launch the scan",
                ]}
                note="Your business email must be present on your website's contact page or in the footer."
              />
              <VerifCard
                selected={verification === "manual"}
                onClick={() => setVerification("manual")}
                badge="No email needed"
                title="Manual Verification"
                desc="We issue a unique verification code that you place anywhere on your website."
                steps={[
                  "Copy your unique verification code",
                  "Paste it in your site's HTML or footer",
                  "Our AI confirms it is live",
                ]}
                note="A meta tag, comment or hidden element all work — visible placement is not required."
              />
            </div>
          </motion.section>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#2563EB] px-6 py-4 text-[15px] font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
              Execute Scan
              <ArrowRight className="size-4" />
            </button>
            <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
              <Lock className="size-3" /> Your data is secure and encrypted.
            </p>
          </div>
        </form>
      </div>

      {flow?.kind === "email" && (
        <EmailOtpDialog
          sentTo={flow.sentTo}
          hint={flow.hint}
          onClose={() => setFlow(null)}
          onResend={async () => {
            const res = await startEmail({ data: { scan_id: flow.scanId } });
            if (!res.ok) {
              toast.error(res.message);
              return;
            }
            setFlow({ ...flow, hint: res.delivered ? null : res.code });
            toast.success("New code generated");
          }}
          onSubmit={async (code) => {
            await confirmEmail({ data: { scan_id: flow.scanId, code } });
            setFlow(null);
            toast.success("Verified — your scan request was sent to our security console");
            navigate({ to: "/dashboard" });
          }}
        />
      )}

      {flow?.kind === "manual" && (
        <ManualCodeDialog
          code={flow.code}
          token={flow.token}
          onClose={() => setFlow(null)}
          onVerify={async () => {
            const res = await confirmManual({ data: { scan_id: flow.scanId } });
            if (!res.verified) {
              toast.error(res.message);
              return false;
            }
            setFlow(null);
            toast.success("Verified — your scan request was sent to our security console");
            navigate({ to: "/dashboard" });
            return true;
          }}
        />
      )}
    </div>
  );
}

function SectionHead({ img, alt, title, desc }: { img: string; alt: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-5">
      <img src={img} alt={alt} loading="lazy" className="size-14 sm:size-[68px] shrink-0 object-contain" />
      <div>
        <h2 className="text-[22px] sm:text-[26px] font-normal tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

const inputShell =
  "group flex items-center gap-3 rounded-xl bg-transparent border border-white/[0.10] px-4 py-3.5 transition focus-within:bg-white/[0.02]";

function Field({
  label, icon, value, onChange, type = "text", placeholder, required,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-[14px] text-white/90">{label}</span> : null}
      <div className={inputShell}>
        <span className="text-white/45 transition group-focus-within:text-white">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/35 focus:outline-none"
        />
      </div>
    </label>
  );
}

function SelectField({
  label, icon, value, onChange, options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] text-white/90">{label}</span>
      <div className={`${inputShell} relative`}>
        <span className="text-white/45 transition group-focus-within:text-white">{icon}</span>
        <select
          value={value}
          onChange={onChange}
          className="flex-1 appearance-none bg-transparent pr-6 text-[14px] text-white focus:outline-none"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#0a0a0c]">{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 size-4 text-white/45" />
      </div>
    </label>
  );
}

function VerifCard({
  selected, onClick, title, desc, steps, note, badge,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  steps: string[];
  note: string;
  badge: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex h-full flex-col rounded-2xl p-5 text-left transition ${
        selected
          ? "bg-white text-black ring-1 ring-white"
          : "bg-transparent text-white ring-1 ring-white/[0.10] hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[15px] ${selected ? "text-black" : "text-white"}`}>{title}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] ${
                selected ? "bg-black/10 text-black/70" : "bg-white/[0.06] text-white/55"
              }`}
            >
              {badge}
            </span>
          </div>
          <p className={`mt-1.5 text-[12.5px] leading-relaxed ${selected ? "text-black/70" : "text-muted-foreground"}`}>{desc}</p>
        </div>
        {selected ? (
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-black text-white">
            <Check className="size-3" />
          </span>
        ) : (
          <ChevronRight className="mt-0.5 size-5 shrink-0 text-white/45" />
        )}
      </div>

      <ol className="mt-4 space-y-2">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-2.5">
            <span
              className={`mt-[1px] grid size-[18px] shrink-0 place-items-center rounded-full text-[10px] font-medium ${
                selected ? "bg-black/[0.07] text-black/70" : "bg-white/[0.06] text-white/60"
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-[12px] leading-snug ${selected ? "text-black/75" : "text-white/70"}`}>{step}</span>
          </li>
        ))}
      </ol>

      <div
        className={`mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-[11.5px] leading-relaxed ${
          selected ? "bg-black/[0.05] text-black/70" : "bg-white/[0.035] text-white/55"
        }`}
      >
        <Info className={`mt-[1px] size-3.5 shrink-0 ${selected ? "text-black/50" : "text-white/40"}`} />
        <span>{note}</span>
      </div>
    </button>
  );
}

function Dialog({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-[#050505] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 font-medium text-white">
              <ShieldCheck className="size-4 text-[#2563EB]" /> {title}
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function EmailOtpDialog({
  sentTo, hint, onClose, onResend, onSubmit,
}: {
  sentTo: string;
  hint: string | null;
  onClose: () => void;
  onResend: () => Promise<void>;
  onSubmit: (code: string) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    if (code.trim().length !== 6) return toast.error("Enter the 6-digit code");
    setBusy(true);
    try {
      await onSubmit(code.trim());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title="Enter verification code" subtitle={`We sent a 6-digit code to ${sentTo}. Enter it below to submit your scan request.`} onClose={onClose}>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        placeholder="••••••"
        className="mt-5 w-full rounded-xl bg-[#0a0a0c] px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none placeholder:text-white/20"
      />
      {hint && (
        <p className="mt-2 text-center text-[11px] text-amber-300/80">
          Email sending isn’t configured yet — your code is <span className="font-mono text-white">{hint}</span>
        </p>
      )}
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0000DD] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0000b8] disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Continue
      </button>
      <button type="button" onClick={() => onResend().catch(() => toast.error("Could not resend"))} className="mt-3 w-full text-[11px] text-muted-foreground hover:text-white">
        Resend code
      </button>
    </Dialog>
  );
}

function ManualCodeDialog({
  code, token, onClose, onVerify,
}: {
  code: string;
  token: string;
  onClose: () => void;
  onVerify: () => Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const snippet = `<meta name="nexefy-site-verification" content="${code}" />`;

  return (
    <Dialog
      title="Add your verification code"
      subtitle="Place this code anywhere on your site — the HTML header, footer, or a hidden element. Then let our AI confirm it."
      onClose={onClose}
    >
      <div className="mt-5 rounded-xl bg-[#0a0a0c] p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Your code</div>
        <div className="mt-1 font-mono text-2xl tracking-[0.3em] text-white">{code}</div>
        <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recommended snippet</div>
        <code className="mt-1 block break-all rounded-lg bg-black/60 p-2.5 font-mono text-[11px] text-sky-300">{snippet}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(snippet);
            toast.success("Snippet copied");
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-[11px] text-white hover:bg-white/10"
        >
          <Copy className="size-3" /> Copy snippet
        </button>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Any visible or hidden occurrence of <span className="font-mono text-white/80">{token}</span> or the code itself works.
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onVerify();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Verification failed");
          } finally {
            setBusy(false);
          }
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0000DD] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0000b8] disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} I’ve added the code
      </button>
    </Dialog>
  );
}
