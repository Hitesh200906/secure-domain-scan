import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadStoreAsset } from "@/lib/uploads";
import type { Store, Product } from "@/lib/business";
import { toast } from "sonner";
import {
  X, ChevronLeft, ChevronRight, Check, Sparkles, Loader2, Upload,
  Rocket, Image as ImageIcon, DollarSign, Layers, Tag, Grid3x3,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type WizardData = {
  product_type: string;
  name: string;
  headline: string;
  short_description: string;
  logo_url: string;
  banner_url: string;
  billing_type: "free" | "one_time" | "monthly" | "yearly";
  price: number;
  trial_days: number;
  apps: string[];
};

const PRODUCT_TYPES = [
  { id: "community", label: "Community", icon: "👥", desc: "Private group / membership" },
  { id: "digital", label: "Digital Product", icon: "📦", desc: "Files, templates, assets" },
  { id: "service", label: "Service", icon: "🛠️", desc: "1-on-1 or done-for-you" },
  { id: "saas", label: "SaaS", icon: "☁️", desc: "Software subscription" },
  { id: "course", label: "Course", icon: "🎓", desc: "Lessons & cohorts" },
  { id: "api", label: "API", icon: "🔌", desc: "Programmatic access" },
  { id: "other", label: "Other", icon: "✨", desc: "Anything else" },
];

const DEFAULT_APPS = ["chat", "announcements", "forum"];
const OPTIONAL_APPS = [
  { key: "faq", label: "FAQ", emoji: "❓" },
  { key: "reviews", label: "Reviews", emoji: "⭐" },
  { key: "resources", label: "Resources", emoji: "📚" },
  { key: "downloads", label: "Downloads", emoji: "⬇️" },
  { key: "feature_requests", label: "Feature Requests", emoji: "💡" },
  { key: "polls", label: "Polls", emoji: "📊" },
  { key: "events", label: "Events", emoji: "📅" },
  { key: "support", label: "Support", emoji: "🛟" },
];

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
  apps: [...DEFAULT_APPS],
};

const STEPS = ["Type", "Basics", "Pricing", "Apps", "Publish"];

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

  const set = <K extends keyof WizardData>(k: K, v: WizardData[K]) =>
    setData(d => ({ ...d, [k]: v }));

  const canNext = (): boolean => {
    if (stepIdx === 0) return !!data.product_type;
    if (stepIdx === 1) return !!data.name && !!data.headline;
    return true;
  };

  const next = () => {
    if (!canNext()) { toast.error("Please fill required fields"); return; }
    setStepIdx(i => Math.min(i + 1, STEPS.length - 1));
  };
  const prev = () => setStepIdx(i => Math.max(0, i - 1));

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
      pricing_extra: data.trial_days ? { trial_days: data.trial_days } : {},
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
    if (!data.name) { toast.error("Product name required"); return; }
    const ok = await persist(status);
    if (ok) {
      toast.success(status === "published" ? "🚀 Product published!" : "Saved as draft");
      onSaved(); onClose();
    }
  };

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
              <button onClick={() => finish("draft")} disabled={saving} className="text-xs rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5">
                Save draft
              </button>
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
          {stepIdx === 0 && <StepType data={data} set={set} onPick={() => setStepIdx(1)} />}
          {stepIdx === 1 && <StepBasics data={data} set={set} store={store} />}
          {stepIdx === 2 && <StepPricing data={data} set={set} />}
          {stepIdx === 3 && <StepApps data={data} set={set} />}
          {stepIdx === 4 && <StepPublish data={data} store={store} />}
        </main>

        <footer className="sticky bottom-0 border-t border-white/5 bg-black/70 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <button onClick={prev} disabled={stepIdx === 0} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm disabled:opacity-30 hover:bg-white/5">
              <ChevronLeft className="size-4" /> Back
            </button>
            <div className="text-xs text-muted-foreground hidden sm:block">
              Launch first. Customize later.
            </div>
            {stepIdx < STEPS.length - 1 ? (
              <button onClick={next} className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition">
                Continue <ChevronRight className="size-4" />
              </button>
            ) : (
              <button onClick={() => finish("published")} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black px-5 py-2 text-sm font-semibold">
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
    product_type: p.product_type ?? "",
    name: p.name ?? "",
    headline: anyP.headline ?? "",
    short_description: anyP.short_description ?? p.description ?? "",
    logo_url: anyP.logo_url ?? p.image_url ?? "",
    banner_url: anyP.banner_url ?? "",
    billing_type: (p.billing_type as any) ?? "one_time",
    price: Number(p.price ?? 0),
    trial_days: anyP.pricing_extra?.trial_days ?? 0,
    apps: anyP.apps ?? [...DEFAULT_APPS],
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

/* ---------- STEP 1: Type ---------- */
function StepType({ data, set, onPick }: any) {
  return (
    <>
      <StepHeading icon={Layers} title="What are you selling?" sub="Pick the type that fits best — you can change it anytime." />
      <div className="grid sm:grid-cols-2 gap-3">
        {PRODUCT_TYPES.map(t => {
          const active = data.product_type === t.id;
          return (
            <button key={t.id} onClick={() => { set("product_type", t.id); setTimeout(onPick, 180); }}
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

/* ---------- STEP 2: Basics with live preview ---------- */
function StepBasics({ data, set, store }: any) {
  const { user } = useAuth();
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);

  const upload = async (file: File, kind: "logo" | "banner") => {
    if (!user) return;
    setUploading(kind);
    try {
      const url = await uploadStoreAsset(user.id, file, `product-${kind}`);
      set(kind === "logo" ? "logo_url" : "banner_url", url);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <>
      <StepHeading icon={Tag} title="The basics" sub="Just the essentials. You can polish details after launch." />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="Product name *">
            <Input value={data.name} onChange={(e: any) => set("name", e.target.value)} placeholder="Nexus Pro" />
          </Field>
          <Field label="Headline *" hint="One bold line that sells the product.">
            <Input value={data.headline} onChange={(e: any) => set("headline", e.target.value)} placeholder="Ship secure code 10x faster" />
          </Field>
          <Field label="Short description">
            <TextArea value={data.short_description} onChange={(e: any) => set("short_description", e.target.value)} placeholder="A 1–2 sentence pitch." />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Logo">
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "logo")} />
              <button onClick={() => logoRef.current?.click()} className="w-full h-20 rounded-lg border border-dashed border-white/15 hover:border-white/30 flex items-center justify-center text-xs text-muted-foreground gap-2">
                {uploading === "logo" ? <Loader2 className="size-4 animate-spin" /> : <><Upload className="size-3.5" /> Upload</>}
              </button>
            </Field>
            <Field label="Banner">
              <input ref={bannerRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "banner")} />
              <button onClick={() => bannerRef.current?.click()} className="w-full h-20 rounded-lg border border-dashed border-white/15 hover:border-white/30 flex items-center justify-center text-xs text-muted-foreground gap-2">
                {uploading === "banner" ? <Loader2 className="size-4 animate-spin" /> : <><Upload className="size-3.5" /> Upload</>}
              </button>
            </Field>
          </div>
        </div>

        {/* Live preview */}
        <div className="md:sticky md:top-32 self-start">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Live preview</div>
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/30 to-emerald-500/10 relative">
              {data.banner_url && <img src={data.banner_url} className="absolute inset-0 w-full h-full object-cover" />}
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3 -mt-10 mb-3">
                <div className="size-14 rounded-xl border-2 border-black bg-white/10 overflow-hidden grid place-items-center text-2xl">
                  {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-cover" /> : <ImageIcon className="size-5 text-muted-foreground" />}
                </div>
              </div>
              <div className="font-semibold">{data.name || "Your product"}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{data.headline || "Your headline will appear here"}</div>
              {data.short_description && <div className="text-xs text-muted-foreground/80 mt-2 line-clamp-3">{data.short_description}</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- STEP 3: Pricing ---------- */
function StepPricing({ data, set }: any) {
  const opts: { id: WizardData["billing_type"]; label: string; desc: string }[] = [
    { id: "free", label: "Free", desc: "Anyone can join" },
    { id: "one_time", label: "One-Time", desc: "Pay once, get access" },
    { id: "monthly", label: "Monthly", desc: "Recurring billing" },
    { id: "yearly", label: "Yearly", desc: "Annual subscription" },
  ];
  return (
    <>
      <StepHeading icon={DollarSign} title="Set your price" sub="Keep it simple. You can run experiments after launch." />
      <div className="grid grid-cols-2 gap-3 mb-6">
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
        <div className="space-y-4 max-w-md">
          <Field label="Price (USD)">
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

/* ---------- STEP 4: Apps ---------- */
function StepApps({ data, set }: any) {
  const toggle = (key: string) => {
    const has = data.apps.includes(key);
    set("apps", has ? data.apps.filter((k: string) => k !== key) : [...data.apps, key]);
  };
  const defaults = [
    { key: "chat", label: "Chat", emoji: "💬" },
    { key: "announcements", label: "Announcements", emoji: "📣" },
    { key: "forum", label: "Forum", emoji: "🗣️" },
  ];
  return (
    <>
      <StepHeading icon={Grid3x3} title="Add some apps" sub="Bundle features into your product page. Add or remove anytime." />
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Recommended</div>
      <div className="grid sm:grid-cols-3 gap-2 mb-6">
        {defaults.map(a => <AppToggle key={a.key} app={a} active={data.apps.includes(a.key)} onToggle={() => toggle(a.key)} />)}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Optional</div>
      <div className="grid sm:grid-cols-3 gap-2">
        {OPTIONAL_APPS.map(a => <AppToggle key={a.key} app={a} active={data.apps.includes(a.key)} onToggle={() => toggle(a.key)} />)}
      </div>
    </>
  );
}

function AppToggle({ app, active, onToggle }: any) {
  return (
    <button onClick={onToggle}
      className={`text-left rounded-xl border p-3 transition flex items-center gap-2.5 ${active ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"}`}>
      <div className="text-xl">{app.emoji}</div>
      <div className="text-sm font-medium flex-1">{app.label}</div>
      {active ? <Check className="size-4 text-emerald-400" /> : <span className="text-xs text-muted-foreground">Add</span>}
    </button>
  );
}

/* ---------- STEP 5: Publish ---------- */
function StepPublish({ data, store }: any) {
  const priceLabel = data.billing_type === "free" ? "Free" :
    `$${Number(data.price).toFixed(2)}${data.billing_type === "monthly" ? "/mo" : data.billing_type === "yearly" ? "/yr" : ""}`;
  return (
    <>
      <StepHeading icon={Rocket} title="Ready to launch" sub="Review and publish. You can edit everything from product settings." />
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02] max-w-lg mx-auto">
        <div className="aspect-[16/9] bg-gradient-to-br from-primary/30 to-emerald-500/10 relative">
          {data.banner_url && <img src={data.banner_url} className="absolute inset-0 w-full h-full object-cover" />}
        </div>
        <div className="p-5">
          <div className="flex items-start gap-3 -mt-12 mb-3">
            <div className="size-16 rounded-xl border-2 border-black bg-white/10 overflow-hidden grid place-items-center text-2xl">
              {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-cover" /> : "📦"}
            </div>
            <div className="ml-auto rounded-full bg-white text-black px-3 py-1 text-xs font-semibold">{priceLabel}</div>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{(data.product_type || "product").replace("_", " ")}</div>
          <div className="text-xl font-semibold mt-0.5">{data.name}</div>
          <div className="text-sm text-muted-foreground mt-1">{data.headline}</div>
          {data.short_description && <div className="text-xs text-muted-foreground/80 mt-3">{data.short_description}</div>}
          {data.apps.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {data.apps.map((a: string) => (
                <span key={a} className="text-[10px] rounded-full border border-white/10 px-2 py-0.5 text-muted-foreground">{a.replace("_", " ")}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground mt-6">
        Publishing to <span className="text-foreground font-medium">{store.name}</span>
      </div>
    </>
  );
}
