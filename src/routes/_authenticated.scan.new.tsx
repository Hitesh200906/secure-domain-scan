import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Lock, Crosshair, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import scanConfigImg from "@/assets/scan-config.png.asset.json";

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
      await api.createScan({
        full_name: form.full_name,
        role_title: form.role_title,
        company: form.company,
        email: form.email,
        target_url: form.target_url,
        business_email: form.business_email,
        plan,
        verification_method: verification,
      });
      toast.success("Scan request submitted");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit scan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-white">
            ← Back to dashboard
          </Link>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
            {info.name} · {info.credits} credits
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          {/* Your Information */}
          <Card>
            <CardHead
              icon={<Emoji>👤</Emoji>}
              title="Your Information"
              desc="Tell us about yourself and your role."
            />
            <div className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-5">
              <Field
                label="Full Name"
                icon={<Emoji size="sm">👤</Emoji>}
                value={form.full_name}
                onChange={update("full_name")}
                placeholder="Jane Smith"
                required
              />
              <SelectField
                label="Role / Title"
                icon={<Emoji size="sm">💼</Emoji>}
                value={form.role_title}
                onChange={update("role_title")}
                options={ROLES}
              />
              <Field
                label="Company Name"
                icon={<Emoji size="sm">🏢</Emoji>}
                value={form.company}
                onChange={update("company")}
                placeholder="Acme Corp"
              />
              <Field
                label="Your Email"
                type="email"
                icon={<Emoji size="sm">✉️</Emoji>}
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                required
              />
              <div className="sm:col-span-2">
                <Field
                  label="Business Email"
                  type="email"
                  icon={<Emoji size="sm">📫</Emoji>}
                  value={form.business_email}
                  onChange={update("business_email")}
                  placeholder="security@example.com"
                />
              </div>
            </div>
          </Card>

          {/* Scan Configuration */}
          <Card>
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
              <div>
                <CardHead
                  icon={<Emoji>🌐</Emoji>}
                  title="Scan Configuration"
                  desc="Provide the website you want us to scan."
                />
                <div className="mt-6">
                  <Field
                    label="Target Website URL"
                    type="url"
                    icon={<Emoji size="sm">🔗</Emoji>}
                    value={form.target_url}
                    onChange={update("target_url")}
                    placeholder="https://example.com"
                    required
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Enter the full URL of the website you want to scan.
                  </p>
                </div>
              </div>
              <img
                src={scanConfigImg.url}
                alt="Illustration of a browser window with a globe being inspected by a magnifying glass"
                loading="lazy"
                width={1024}
                height={768}
                className="hidden md:block w-[320px] h-auto rounded-xl"
              />
            </div>
          </Card>

          {/* Domain Ownership Verification */}
          <Card>
            <CardHead
              icon={<Emoji>🛡️</Emoji>}
              title="Domain Ownership Verification"
              desc="Choose a method to verify that you own the domain."
            />
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <VerifCard
                selected={verification === "email"}
                onClick={() => setVerification("email")}
                icon={<Emoji size="sm">📧</Emoji>}
                title="Email Verification"
                desc="We'll send a confirmation link to your business email. Click the link to confirm domain ownership and queue the scan."
              />
              <VerifCard
                selected={verification === "manual"}
                onClick={() => setVerification("manual")}
                icon={<span className="text-base font-mono text-sky-300">{"</>"}</span>}
                title="Manual Code"
                desc="We generate a 6-character code. Paste it anywhere on your site (footer, meta tag, hidden div). Our AI crawls your site to verify it's there."
              />
            </div>
          </Card>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl px-6 py-4 text-[15px] font-medium text-white bg-[#0b1a3a] border border-white/10 hover:bg-[#0000DD] transition-colors inline-flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
              Execute Scan
              <ArrowRight className="size-4" />
            </button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center inline-flex w-full items-center justify-center gap-1.5">
              <Lock className="size-3" /> Your data is secure and encrypted.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl bg-[#050505] border border-white/[0.07] p-5 sm:p-7"
    >
      {children}
    </motion.section>
  );
}

function Emoji({ children, size = "md" }: { children: React.ReactNode; size?: "sm" | "md" }) {
  return (
    <span
      className={`grid place-items-center rounded-xl bg-[#0d0d0f] border border-white/[0.08] ${
        size === "md" ? "size-11 text-2xl" : "size-8 text-base"
      }`}
    >
      {children}
    </span>
  );
}

function CardHead({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

const inputShell =
  "mt-2 flex items-center gap-3 rounded-xl bg-[#0a0a0c] border border-white/[0.08] px-3 py-2.5 focus-within:border-white/20 transition";

function Field({
  label,
  icon,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
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
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={inputShell}>
        {icon}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={`${inputShell} relative`}>
        {icon}
        <select
          value={value}
          onChange={onChange}
          className="flex-1 appearance-none bg-transparent text-sm text-white focus:outline-none pr-6"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#0a0a0c]">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="size-4 text-muted-foreground absolute right-3 pointer-events-none" />
      </div>
    </label>
  );
}

function VerifCard({
  selected,
  onClick,
  icon,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-4 border border-transparent transition ${
        selected
          ? "bg-[#dbe9ff]"
          : "bg-[#0a0a0c] hover:bg-[#101014]"
      }`}

    >
      <div className="flex items-start gap-3">
        <span className={`size-9 shrink-0 grid place-items-center rounded-xl ${selected ? "bg-white/70" : "bg-[#0d0d0f] border border-white/[0.08]"}`}>
          {icon}
        </span>
        <div className="flex-1">
          <div className={`text-sm font-medium ${selected ? "text-[#0a1020]" : "text-white"}`}>{title}</div>
          <p className={`mt-1 text-[11px] leading-relaxed ${selected ? "text-[#0a1020]/70" : "text-muted-foreground"}`}>{desc}</p>
        </div>
        <span
          className={`size-5 shrink-0 rounded-full grid place-items-center transition ${
            selected ? "bg-[#0000DD] text-white" : "border border-white/25"
          }`}
        >
          {selected && <Check className="size-3" />}
        </span>
      </div>

    </button>
  );
}
