import { useState, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadStoreAsset } from "@/lib/uploads";
import type { Store, Product } from "@/lib/business";
import { toast } from "sonner";
import {
  X, ChevronLeft, ChevronRight, Check, Sparkles, Loader2, Upload,
  Rocket, Image as ImageIcon, DollarSign, Layers, Tag, Grid3x3, Settings2, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { APP_CATALOG, APP_MAP, type AppKey, getInstalledApps, installApp } from "@/lib/store-apps";

type TypeId = "community" | "digital" | "service" | "saas" | "course" | "api" | "source_code" | "other";

type WizardData = {
  product_type: TypeId | "";
  name: string;
  headline: string;
  short_description: string;
  logo_url: string;
  banner_url: string;
  billing_type: "free" | "one_time" | "monthly" | "yearly";
  price: number;
  trial_days: number;
  apps: AppKey[];
  details: Record<string, string>; // type-specific
};

const PRODUCT_TYPES: { id: TypeId; label: string; icon: string; desc: string }[] = [
  { id: "community", label: "Community", icon: "👥", desc: "Private group / membership" },
  { id: "digital", label: "Digital Product", icon: "📦", desc: "Files, templates, assets" },
  { id: "service", label: "Service", icon: "🛠️", desc: "1-on-1 or done-for-you" },
  { id: "saas", label: "SaaS", icon: "☁️", desc: "Software subscription" },
  { id: "course", label: "Course", icon: "🎓", desc: "Lessons & cohorts" },
  { id: "api", label: "API", icon: "🔌", desc: "Programmatic access" },
  { id: "source_code", label: "Source Code", icon: "💻", desc: "Codebase / repo" },
  { id: "other", label: "Other", icon: "✨", desc: "Anything else" },
];

type TypeConfig = {
  suggestedApps: AppKey[];
  fields: { key: string; label: string; placeholder?: string; type?: "text" | "url" | "textarea" }[];
};

const TYPE_CONFIG: Record<TypeId, TypeConfig> = {
  community: {
    suggestedApps: ["chat", "announcements", "forum", "events", "members"],
    fields: [],
  },
  digital: {
    suggestedApps: ["downloads", "reviews", "support", "faq"],
    fields: [],
  },
  service: {
    suggestedApps: ["support", "reviews", "faq"],
    fields: [
      { key: "delivery_time", label: "Delivery time", placeholder: "e.g. 3 days" },
      { key: "revisions", label: "Revisions included", placeholder: "e.g. 2" },
      { key: "availability", label: "Availability", placeholder: "e.g. Mon–Fri, 9–5 UTC" },
    ],
  },
  saas: {
    suggestedApps: ["announcements", "changelog", "feature_requests", "support"],
    fields: [
      { key: "website_url", label: "Website URL", placeholder: "https://...", type: "url" },
      { key: "docs_url", label: "Documentation URL", placeholder: "https://...", type: "url" },
      { key: "demo_url", label: "Demo URL", placeholder: "https://...", type: "url" },
    ],
  },
  course: {
    suggestedApps: ["chat", "announcements", "resources", "reviews"],
    fields: [],
  },
  api: {
    suggestedApps: ["resources", "changelog", "support"],
    fields: [
      { key: "docs_url", label: "API documentation", placeholder: "https://...", type: "url" },
      { key: "base_url", label: "Base URL", placeholder: "https://api.example.com" },
      { key: "auth_method", label: "Authentication method", placeholder: "API Key / OAuth2" },
    ],
  },
  source_code: {
    suggestedApps: ["downloads", "resources", "support"],
    fields: [
      { key: "github_url", label: "GitHub repository", placeholder: "https://github.com/...", type: "url" },
      { key: "version", label: "Version", placeholder: "1.0.0" },
      { key: "install_guide", label: "Installation guide", placeholder: "Short setup steps", type: "textarea" },
    ],
  },
  other: { suggestedApps: ["chat", "announcements"], fields: [] },
};

const empty: WizardData = {
  product_type: "",
  name: "",
  headline: "",
  short_description: "",
  logo_url: "",
  banner_url: "",
  billing_type: "one_time",
  price: 0,
  trial_days: 0,
  apps: ["chat", "announcements", "forum"],
  details: {},
};

export function ProductWizard({
  store, onClose, onSaved, initial,
}: {
  store: Store;
  onClose: () => void;
  onSaved: () => void;
  initial?: Partial<Product> | null;
}) {
  const [data, setData] = useState<WizardData>(() => ({ ...empty, ...mapInitial(initial) }));
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const typeCfg = data.product_type ? TYPE_CONFIG[data.product_type] : null;
  const hasDetailsStep = !!typeCfg?.fields.length;

  const STEPS = useMemo(() => {
    const base = ["Type", "Basics"];
    if (hasDetailsStep) base.push("Details");
    base.push("Pricing", "Apps", "Publish");
    return base;
  }, [hasDetailsStep]);

  const set = <K extends keyof WizardData>(k: K, v: WizardData[K]) =>
    setData(d => ({ ...d, [k]: v }));

  const pickType = (id: TypeId) => {
    const cfg = TYPE_CONFIG[id];
    setData(d => ({
      ...d,
      product_type: id,
      // auto-suggest apps (merge with any already chosen)
      apps: Array.from(new Set([...d.apps, ...cfg.suggestedApps])) as AppKey[],
      // pre-fill billing when it makes sense
      billing_type: id === "saas" ? "monthly" : id === "community" ? "monthly" : d.billing_type,
    }));
    setTimeout(() => setStepIdx(1), 180);
  };

  const canNext = (): boolean => {
    const key = STEPS[stepIdx];
    if (key === "Type") return !!data.product_type;
    if (key === "Basics") return !!data.name && !!data.headline;
    return true;
  };

  const next = () => {
    if (!canNext()) { toast.error("Please fill required fields"); return; }
    setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
  };
  const prev = () => setStepIdx(i => Math.max(0, i - 1));

  /* ---------- validation ---------- */
  const validation = useMemo(() => {
    const missing: { label: string; goto: number }[] = [];
    if (!data.name) missing.push({ label: "Product name", goto: STEPS.indexOf("Basics") });
    if (!data.headline) missing.push({ label: "Headline", goto: STEPS.indexOf("Basics") });
    if (!data.short_description) missing.push({ label: "Short description", goto: STEPS.indexOf("Basics") });
    if (!data.logo_url) missing.push({ label: "Product logo", goto: STEPS.indexOf("Basics") });
    if (!data.banner_url) missing.push({ label: "Product banner", goto: STEPS.indexOf("Basics") });
    if (data.billing_type !== "free" && !(data.price > 0))
      missing.push({ label: "Price greater than $0", goto: STEPS.indexOf("Pricing") });
    return missing;
  }, [data, STEPS]);

  /* ---------- after publish: ensure store has suggested apps ---------- */
  const syncStoreApps = async () => {
    if (!data.product_type) return;
    try {
      const installed = await getInstalledApps(store.id);
      const have = new Set(installed.map(a => a.app_key));
      let pos = installed.length;
      const wanted = Array.from(new Set([...TYPE_CONFIG[data.product_type].suggestedApps, ...data.apps]));
      for (const key of wanted) {
        if (!have.has(key) && APP_MAP[key]) {
          await installApp(store.id, key, pos++);
        }
      }
    } catch { /* non-fatal */ }
  };

  const persist = async (status: "draft" | "published") => {
    setSaving(true);
    const payload: any = {
      store_id: store.id,
      name: data.name,
      headline: data.headline || null,
      short_description: data.short_description || null,
      description: data.short_description || null,
      product_type: data.product_type || "digital",
      image_url: data.logo_url || null,
      logo_url: data.logo_url || null,
      banner_url: data.banner_url || null,
      billing_type: data.billing_type,
      price: Number(data.price ?? 0),
      pricing_extra: {
        ...(data.trial_days ? { trial_days: data.trial_days } : {}),
        type_details: data.details,
      },
      apps: data.apps,
      status,
      active: status === "published",
    };
    const { error } = initial?.id
      ? await supabase.from("products").update(payload).eq("id", initial.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return false; }
    return true;
  };

  const finish = async (status: "draft" | "published") => {
    if (status === "published" && validation.length) {
      toast.error(`Fix ${validation.length} issue${validation.length > 1 ? "s" : ""} before publishing`);
      return;
    }
    if (!data.name) { toast.error("Product name required"); return; }
    const ok = await persist(status);
    if (!ok) return;
    if (status === "published") await syncStoreApps();
    toast.success(status === "published" ? "🚀 Product published — live on your store, discover & search" : "Saved as draft");
    onSaved(); onClose();
  };

  const stepKey = STEPS[stepIdx];

  return (
    <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 text-primary" />
              <span className="font-semibold">{initial?.id ? "Edit Product" : "New Product"}</span>
              <span className="text-muted-foreground">· {store.name}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => finish("draft")} disabled={saving} className="text-xs rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5">Save draft</button>
              <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/5"><X className="size-4" /></button>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-6 pb-3">
            <div className="flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex-1 flex items-center gap-2">
                  <div className={`flex-1 h-1.5 rounded-full transition ${i <= stepIdx ? "bg-primary" : "bg-white/10"}`} />
                  {i === STEPS.length - 1 && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {stepIdx + 1}/{STEPS.length} · {STEPS[stepIdx]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
          {stepKey === "Type" && <StepType data={data} onPick={pickType} />}
          {stepKey === "Basics" && <StepBasics data={data} set={set} />}
          {stepKey === "Details" && typeCfg && <StepDetails data={data} set={set} cfg={typeCfg} typeId={data.product_type as TypeId} />}
          {stepKey === "Pricing" && <StepPricing data={data} set={set} />}
          {stepKey === "Apps" && <StepApps data={data} set={set} />}
          {stepKey === "Publish" && <StepPublish data={data} store={store} validation={validation} jump={setStepIdx} />}
        </main>

        <footer className="sticky bottom-0 border-t border-white/5 bg-black/70 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <button onClick={prev} disabled={stepIdx === 0} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm disabled:opacity-30 hover:bg-white/5">
              <ChevronLeft className="size-4" /> Back
            </button>
            <div className="text-xs text-muted-foreground hidden sm:block">Launch first. Customize later.</div>
            {stepIdx < STEPS.length - 1 ? (
              <button onClick={next} className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition">
                Continue <ChevronRight className="size-4" />
              </button>
            ) : (
              <button onClick={() => finish("published")} disabled={saving || validation.length > 0}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black px-5 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />} Publish now
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function mapInitial(p?: Partial<Product> | null): Partial<WizardData> {
  if (!p) return {};
  const anyP = p as any;
  return {
    product_type: (p.product_type as TypeId) ?? "",
    name: p.name ?? "",
    headline: anyP.headline ?? "",
    short_description: anyP.short_description ?? p.description ?? "",
    logo_url: anyP.logo_url ?? p.image_url ?? "",
    banner_url: anyP.banner_url ?? "",
    billing_type: (p.billing_type as any) ?? "one_time",
    price: Number(p.price ?? 0),
    trial_days: anyP.pricing_extra?.trial_days ?? 0,
    apps: anyP.apps ?? ["chat", "announcements", "forum"],
    details: anyP.pricing_extra?.type_details ?? {},
  };
}

/* ---------- atoms ---------- */
const Field = ({ label, hint, children }: any) => (
  <label className="block">
    <div className="text-xs font-medium mb-1.5 text-muted-foreground">{label}</div>
    {children}
    {hint && <div className="text-[10px] text-muted-foreground/70 mt-1">{hint}</div>}
  </label>
);
const Input = (p: any) => <input {...p} className={`w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition ${p.className??""}`} />;
const TextArea = (p: any) => <textarea {...p} className={`w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition min-h-[90px] ${p.className??""}`} />;

function StepHeading({ icon: Icon, title, sub }: any) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
        <Icon className="size-6 text-primary" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{sub}</p>
    </div>
  );
}

/* ---------- STEP: Type ---------- */
function StepType({ data, onPick }: any) {
  return (
    <>
      <StepHeading icon={Layers} title="What are you selling?" sub="We'll tailor the setup, fields, and apps to your choice." />
      <div className="grid sm:grid-cols-2 gap-3">
        {PRODUCT_TYPES.map(t => {
          const active = data.product_type === t.id;
          return (
            <button key={t.id} onClick={() => onPick(t.id)}
              className={`text-left rounded-2xl border p-4 transition flex items-center gap-3 ${active ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.03]"}`}>
              <div className="text-3xl">{t.icon}</div>
              <div className="min-w-0">
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-[11px] text-muted-foreground">{t.desc}</div>
              </div>
              {active && <Check className="size-4 text-emerald-400 ml-auto" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- STEP: Basics ---------- */
function StepBasics({ data, set }: any) {
  const { user } = useAuth();
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);
  const isCommunity = data.product_type === "community";

  const upload = async (file: File, kind: "logo" | "banner") => {
    if (!user) return;
    setUploading(kind);
    try {
      const url = await uploadStoreAsset(user.id, file, `product-${kind}`);
      set(kind === "logo" ? "logo_url" : "banner_url", url);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally { setUploading(null); }
  };

  return (
    <>
      <StepHeading icon={Tag} title={isCommunity ? "Set up your community" : "The basics"} sub="Just the essentials. Polish details after launch." />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label={`${isCommunity ? "Community" : "Product"} name *`}>
            <Input value={data.name} onChange={(e: any) => set("name", e.target.value)} placeholder={isCommunity ? "Indie Hackers Club" : "Nexefy Pro"} />
          </Field>
          <Field label="Headline *" hint="One bold line that sells it.">
            <Input value={data.headline} onChange={(e: any) => set("headline", e.target.value)} placeholder="Ship secure code 10x faster" />
          </Field>
          <Field label={`${isCommunity ? "Community" : "Short"} description`}>
            <TextArea value={data.short_description} onChange={(e: any) => set("short_description", e.target.value)} placeholder="A 1–2 sentence pitch." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={isCommunity ? "Community logo" : "Logo"}>
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "logo")} />
              <button onClick={() => logoRef.current?.click()} className="w-full h-20 rounded-lg border border-dashed border-white/15 hover:border-white/30 flex items-center justify-center text-xs text-muted-foreground gap-2 overflow-hidden">
                {uploading === "logo" ? <Loader2 className="size-4 animate-spin" />
                  : data.logo_url ? <img src={data.logo_url} className="h-full w-full object-cover" />
                  : <><Upload className="size-3.5" /> Upload</>}
              </button>
            </Field>
            <Field label={isCommunity ? "Community banner" : "Banner"}>
              <input ref={bannerRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "banner")} />
              <button onClick={() => bannerRef.current?.click()} className="w-full h-20 rounded-lg border border-dashed border-white/15 hover:border-white/30 flex items-center justify-center text-xs text-muted-foreground gap-2 overflow-hidden">
                {uploading === "banner" ? <Loader2 className="size-4 animate-spin" />
                  : data.banner_url ? <img src={data.banner_url} className="h-full w-full object-cover" />
                  : <><Upload className="size-3.5" /> Upload</>}
              </button>
            </Field>
          </div>
        </div>

        <div className="md:sticky md:top-32 self-start">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Live preview</div>
          <PreviewCard data={data} />
        </div>
      </div>
    </>
  );
}

/* ---------- STEP: Details (type-specific) ---------- */
function StepDetails({ data, set, cfg, typeId }: any) {
  const update = (k: string, v: string) => set("details", { ...data.details, [k]: v });
  return (
    <>
      <StepHeading icon={Settings2} title={`${PRODUCT_TYPES.find(t => t.id === typeId)?.label} details`} sub="A few extras tailored to your product type. All optional." />
      <div className="space-y-4 max-w-lg mx-auto">
        {cfg.fields.map((f: any) => (
          <Field key={f.key} label={f.label}>
            {f.type === "textarea"
              ? <TextArea value={data.details[f.key] ?? ""} onChange={(e: any) => update(f.key, e.target.value)} placeholder={f.placeholder} />
              : <Input type={f.type ?? "text"} value={data.details[f.key] ?? ""} onChange={(e: any) => update(f.key, e.target.value)} placeholder={f.placeholder} />}
          </Field>
        ))}
      </div>
    </>
  );
}

/* ---------- STEP: Pricing ---------- */
function StepPricing({ data, set }: any) {
  const opts: { id: WizardData["billing_type"]; label: string; desc: string }[] = [
    { id: "free", label: "Free", desc: "Anyone can join" },
    { id: "one_time", label: "One-Time", desc: "Pay once, get access" },
    { id: "monthly", label: "Monthly", desc: "Recurring billing" },
    { id: "yearly", label: "Yearly", desc: "Annual subscription" },
  ];
  return (
    <>
      <StepHeading icon={DollarSign} title="Set your price" sub="Keep it simple. You can experiment after launch." />
      <div className="grid grid-cols-2 gap-3 mb-6 max-w-lg mx-auto">
        {opts.map(o => {
          const active = data.billing_type === o.id;
          return (
            <button key={o.id} onClick={() => set("billing_type", o.id)}
              className={`text-left rounded-xl border p-4 transition ${active ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"}`}>
              <div className="font-medium text-sm">{o.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{o.desc}</div>
            </button>
          );
        })}
      </div>
      {data.billing_type !== "free" && (
        <div className="space-y-4 max-w-md mx-auto">
          <Field label={data.product_type === "service" ? "Starting price (USD)" : "Price (USD)"}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input type="number" min="0" step="0.01" value={data.price} onChange={(e: any) => set("price", Number(e.target.value))} className="pl-7" />
            </div>
          </Field>
          {(data.billing_type === "monthly" || data.billing_type === "yearly") && (
            <Field label="Trial days (optional)">
              <Input type="number" min="0" value={data.trial_days} onChange={(e: any) => set("trial_days", Number(e.target.value))} placeholder="0" />
            </Field>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- STEP: Apps ---------- */
function StepApps({ data, set }: any) {
  const toggle = (key: AppKey) => {
    const has = data.apps.includes(key);
    set("apps", has ? data.apps.filter((k: AppKey) => k !== key) : [...data.apps, key]);
  };
  const suggested = data.product_type ? TYPE_CONFIG[data.product_type as TypeId].suggestedApps : [];
  const suggestedSet = new Set(suggested);
  const others = APP_CATALOG.filter(a => !suggestedSet.has(a.key));

  return (
    <>
      <StepHeading icon={Grid3x3} title="Add some apps" sub="We picked the best apps for your product type. One click to add or remove." />
      {suggested.length > 0 && (
        <>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="size-3 text-primary" /> Suggested for {PRODUCT_TYPES.find(t => t.id === data.product_type)?.label}
          </div>
          <div className="grid sm:grid-cols-3 gap-2 mb-6">
            {suggested.map(key => {
              const a = APP_MAP[key];
              return a ? <AppToggle key={key} app={a} active={data.apps.includes(key)} onToggle={() => toggle(key)} /> : null;
            })}
          </div>
        </>
      )}
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">More apps</div>
      <div className="grid sm:grid-cols-3 gap-2">
        {others.map(a => <AppToggle key={a.key} app={a} active={data.apps.includes(a.key)} onToggle={() => toggle(a.key)} />)}
      </div>
      <div className="mt-6 text-[11px] text-muted-foreground text-center">
        Apps auto-create starter content (channels, categories, FAQ entries) when installed.
      </div>
    </>
  );
}

function AppToggle({ app, active, onToggle }: any) {
  return (
    <button onClick={onToggle}
      className={`text-left rounded-xl border p-3 transition flex items-center gap-2.5 ${active ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"}`}>
      <img src={app.logo} className="size-8 rounded-md object-cover" />
      <div className="text-sm font-medium flex-1 truncate">{app.name}</div>
      {active ? <Check className="size-4 text-emerald-400" /> : <span className="text-[10px] text-muted-foreground">Add</span>}
    </button>
  );
}

/* ---------- Preview card ---------- */
function PreviewCard({ data }: any) {
  const priceLabel = data.billing_type === "free" ? "Free" :
    data.price > 0 ? `$${Number(data.price).toFixed(2)}${data.billing_type === "monthly" ? "/mo" : data.billing_type === "yearly" ? "/yr" : ""}` : "—";
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
      <div className="aspect-[16/9] bg-gradient-to-br from-primary/30 to-emerald-500/10 relative">
        {data.banner_url && <img src={data.banner_url} className="absolute inset-0 w-full h-full object-cover" />}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3 -mt-10 mb-3">
          <div className="size-14 rounded-xl border-2 border-black bg-white/10 overflow-hidden grid place-items-center text-2xl">
            {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-cover" /> : <ImageIcon className="size-5 text-muted-foreground" />}
          </div>
          <div className="ml-auto rounded-full bg-white text-black px-2.5 py-0.5 text-xs font-semibold">{priceLabel}</div>
        </div>
        <div className="font-semibold">{data.name || "Your product"}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{data.headline || "Your headline appears here"}</div>
        {data.short_description && <div className="text-xs text-muted-foreground/80 mt-2 line-clamp-3">{data.short_description}</div>}
      </div>
    </div>
  );
}

/* ---------- STEP: Publish ---------- */
function StepPublish({ data, store, validation, jump }: any) {
  return (
    <>
      <StepHeading icon={Rocket} title="Ready to launch" sub="Once published, your product appears on your store, the Discover page, and search results automatically." />

      {validation.length > 0 && (
        <div className="max-w-lg mx-auto mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-medium mb-2">
            <AlertTriangle className="size-4" /> Fix {validation.length} thing{validation.length > 1 ? "s" : ""} before publishing
          </div>
          <ul className="space-y-1.5">
            {validation.map((v: any, i: number) => (
              <li key={i} className="flex items-center justify-between text-xs">
                <span className="text-amber-200/90">• {v.label}</span>
                <button onClick={() => jump(v.goto)} className="text-amber-300 hover:underline">Fix</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="max-w-lg mx-auto">
        <PreviewCard data={data} />
        {data.apps.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {data.apps.map((a: string) => (
              <span key={a} className="text-[10px] rounded-full border border-white/10 px-2 py-0.5 text-muted-foreground">
                {APP_MAP[a]?.name ?? a}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 max-w-lg mx-auto rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-xs text-emerald-200/90 space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-300 font-medium"><Check className="size-3.5" /> What happens next</div>
        <div>• Listed on <strong>{store.name}</strong> store homepage & Products tab</div>
        <div>• Appears on the Discover page and search results</div>
        <div>• Suggested apps are auto-installed with starter content</div>
      </div>
    </>
  );
}
