import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Loader2, Mail, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

type Plan = "starter" | "professional" | "enterprise";

const PLAN_INFO: Record<Plan, { name: string; credits: number }> = {
  starter: { name: "Starter", credits: 1 },
  professional: { name: "Professional", credits: 15 },
  enterprise: { name: "Enterprise", credits: 999 },
};

export const Route = createFileRoute("/_authenticated/scan/new")({
  validateSearch: (s: Record<string, unknown>): { plan: Plan } => {
    const p = String(s.plan ?? "professional");
    const plan: Plan = p === "starter" || p === "enterprise" ? p : "professional";
    return { plan };
  },
  head: () => ({ meta: [{ title: "New Scan — Nexefy Security" }] }),
  component: ScanNewPage,
});

function ScanNewPage() {
  const { plan } = useSearch({ from: "/_authenticated/scan/new" }) as { plan: Plan };
  const { user } = useAuth();
  const navigate = useNavigate();
  const info = PLAN_INFO[plan];

  const [form, setForm] = useState({
    full_name: "",
    role_title: "",
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

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
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
    <div className="min-h-screen relative">
      <div className="absolute inset-0 hero-gradient -z-10 opacity-60" />
      <div className="absolute inset-0 grid-bg opacity-30 -z-10" />

      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-white">
          ← Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-4"
        >
          <div className="size-12 rounded-full glass grid place-items-center text-primary">
            <ScanSearch className="size-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Scan Request</h1>
            <div className="text-xs uppercase tracking-[0.18em] text-primary mt-1 font-mono">
              PLAN: {info.name.toUpperCase()} — {info.credits} CREDITS
            </div>
          </div>
        </motion.div>

        <form onSubmit={submit} className="mt-10 space-y-10">
          <section className="grid sm:grid-cols-2 gap-5">
            <Field label="Full Name" value={form.full_name} onChange={update("full_name")} placeholder="Jane Smith" required />
            <Field label="Role / Title" value={form.role_title} onChange={update("role_title")} placeholder="Security Engineer" />
            <Field label="Company Name" value={form.company} onChange={update("company")} placeholder="Acme Corp" />
            <Field label="Your Email" type="email" value={form.email} onChange={update("email")} placeholder="jane@example.com" required />
            <Field label="Target Website URL" type="url" value={form.target_url} onChange={update("target_url")} placeholder="https://example.com" required />
            <Field label="Business Email" type="email" value={form.business_email} onChange={update("business_email")} placeholder="security@example.com" />
          </section>

          <section>
            <h2 className="text-xl font-semibold">Ownership Verification</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">We need to confirm you own the domain before scanning it.</p>

            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <VerifCard
                selected={verification === "email"}
                onClick={() => setVerification("email")}
                icon={<Mail className="size-4" />}
                title="Email Verification"
                desc="We send a confirmation link to your business email. Click it to confirm domain ownership and queue the scan."
              />
              <VerifCard
                selected={verification === "manual"}
                onClick={() => setVerification("manual")}
                icon={<Code2 className="size-4" />}
                title="Manual Code"
                desc="We generate a 6-character code. Paste it anywhere on your site (footer, meta tag, hidden div). Our AI crawls your site to verify it's there."
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl px-6 py-4 text-base font-medium text-white bg-gradient-to-r from-[oklch(0.45_0.13_180)] to-[oklch(0.55_0.15_180)] hover:shadow-[0_0_40px_-4px_oklch(0.75_0.13_180_/0.7)] transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Execute Scan →
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-white">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl bg-[oklch(0.06_0.008_220)] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition"
      />
    </label>
  );
}

function VerifCard({ selected, onClick, icon, title, desc }: {
  selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-5 border transition ${
        selected ? "border-primary/60 bg-primary/[0.04] shadow-[0_0_30px_-10px_oklch(0.86_0.16_200_/0.5)]" : "border-white/10 bg-white/[0.02] hover:border-white/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`size-5 rounded-full border-2 grid place-items-center transition ${selected ? "border-primary" : "border-white/30"}`}>
          {selected && <span className="size-2 rounded-full bg-primary" />}
        </span>
        <span className="text-primary">{icon}</span>
        <span className="text-base font-medium">{title}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </button>
  );
}
