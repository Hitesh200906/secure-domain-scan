import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
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
const scanConfigBg = { url: "/images/scan-config-bg.png" };


type Plan = "starter" | "professional" | "enterprise";

const PLAN_INFO: Record<Plan, { name: string; credits: number }> = {
  starter: { name: "Starter", credits: 49 },
  professional: { name: "Professional", credits: 199 },
  enterprise: { name: "Enterprise", credits: 899 },
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
  const [livePlan, setLivePlan] = useState<{ name: string; credits: number } | null>(null);
  const info = livePlan ?? PLAN_INFO[plan];

  useEffect(() => {
    api.publicPricing()
      .then(({ plans }) => {
        const p = (plans as Array<{ slug: string; name: string; price_monthly: number }> | undefined)
          ?.find((x) => x.slug === plan);
        if (p) setLivePlan({ name: p.name, credits: p.price_monthly });
      })
      .catch(() => { /* keep fallback */ });
  }, [plan]);


  const [form, setForm] = useState({
    full_name: "",
    role_title: "Security Engineer",
    company: "",
    email: "",
    target_url: "",
  });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const { scan } = await api.createScan({
        full_name: form.full_name,
        role_title: form.role_title,
        company: form.company,
        email: user.email ?? form.email,
        target_url: form.target_url,
        plan,
        status: "awaiting_config",
      } as never);
      const scanId = (scan as { id: string }).id;
      toast.success("Details saved — continue to scan configuration");
      navigate({ to: "/scan/configure", search: { id: scanId } });
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
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80">
            <span>{info.name}</span>
            <span className="text-white/25">·</span>
            <span className="text-white">{info.credits.toLocaleString()} credits</span>
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
              <Field
                label="Your Email"
                type="email"
                icon={<Mail className="size-[18px]" />}
                value={form.email}
                onChange={() => { /* locked to the signed-in account */ }}
                readOnly
                required
                hint="This is the email your Nexefy account was created with. Your report is delivered to this account."
              />
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
  label, icon, value, onChange, type = "text", placeholder, required, readOnly, hint,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-[14px] text-white/90">{label}</span> : null}
      <div className={`${inputShell} ${readOnly ? "bg-white/[0.04] opacity-90" : ""}`}>
        <span className="text-white/45 transition group-focus-within:text-white">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          aria-readonly={readOnly}
          className={`flex-1 bg-transparent text-[14px] text-white placeholder:text-white/35 focus:outline-none ${readOnly ? "cursor-not-allowed text-white/70" : ""}`}
        />
        {readOnly ? <Lock className="size-3.5 text-white/35" /> : null}
      </div>
      {hint ? <span className="mt-2 block text-[11.5px] text-white/45">{hint}</span> : null}
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
