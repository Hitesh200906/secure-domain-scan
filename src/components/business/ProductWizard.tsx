import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadStoreAsset } from "@/lib/uploads";
import type { Store, Product } from "@/lib/business";
import { toast } from "sonner";
import {
  X, ChevronLeft, ChevronRight, Check, Sparkles, Loader2, Upload, Plus, Trash2,
  Image as ImageIcon, Tag, DollarSign, Package, Wrench, Users, Send,
  Search, Eye, Rocket, Layers, Code2, Globe, Github, FileText, Play,
} from "lucide-react";

type StepKey =
  | "type" | "basics" | "branding" | "pricing" | "details"
  | "service" | "community" | "access" | "apps" | "seo" | "preview" | "publish";

type WizardData = {
  product_type: string;
  name: string;
  headline: string;
  short_description: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  logo_url: string;
  banner_url: string;
  thumbnail_url: string;
  gallery: string[];
  demo_video_url: string;
  preview_url: string;
  github_url: string;
  docs_url: string;
  billing_type: string;
  price: number;
  pricing_extra: { discount?: number; trial_days?: number; launch_offer?: string };
  features: string[];
  requirements: string[];
  version: string;
  changelog: string;
  service_settings: { delivery_time?: string; revisions?: number; support_duration?: string; communication?: string; availability?: string; project_size?: string };
  community: { enabled: boolean; mode?: "create" | "existing"; access_level?: string; name?: string };
  access: { method: string; files: string[]; link: string; api_keys: string; instructions: string };
  apps: string[];
  seo: { title?: string; description?: string; keywords?: string; tags?: string; discover_category?: string; featured?: boolean };
  status: "draft" | "published" | "scheduled";
  scheduled_at?: string | null;
};

const PRODUCT_TYPES = [
  { id: "service", label: "Service", icon: "🛠️" },
  { id: "saas", label: "SaaS", icon: "☁️" },
  { id: "api", label: "API", icon: "🔌" },
  { id: "ai_tool", label: "AI Tool", icon: "🤖" },
  { id: "source_code", label: "Source Code", icon: "💻" },
  { id: "template", label: "Template", icon: "🎨" },
  { id: "script", label: "Script", icon: "📜" },
  { id: "chrome_extension", label: "Chrome Extension", icon: "🧩" },
  { id: "mobile_app", label: "Mobile App", icon: "📱" },
  { id: "community", label: "Community Access", icon: "👥" },
  { id: "course", label: "Course", icon: "🎓" },
  { id: "digital_download", label: "Digital Download", icon: "📦" },
  { id: "subscription", label: "Subscription", icon: "🔁" },
];

const AVAILABLE_APPS = [
  "Community Chat","Announcements","Support Tickets","FAQ","Changelog","Roadmap","Reviews",
  "Knowledge Base","Resources","File Library","Documentation","Discussions","Polls","Events",
  "Product Updates","Feedback Board","Feature Requests","Customer Showcase","Affiliate Program",
];

const SUGGESTED_TAGS = ["React","Next.js","Node.js","Python","AI","Cybersecurity","DevOps","SaaS","TypeScript","Rust"];

const STEPS: { key: StepKey; label: string; icon: any }[] = [
  { key: "type", label: "Type", icon: Layers },
  { key: "basics", label: "Basics", icon: Tag },
  { key: "branding", label: "Branding", icon: ImageIcon },
  { key: "pricing", label: "Pricing", icon: DollarSign },
  { key: "details", label: "Details", icon: Package },
  { key: "service", label: "Service", icon: Wrench },
  { key: "community", label: "Community", icon: Users },
  { key: "access", label: "Delivery", icon: Send },
  { key: "apps", label: "Apps", icon: Sparkles },
  { key: "seo", label: "SEO", icon: Search },
  { key: "preview", label: "Preview", icon: Eye },
  { key: "publish", label: "Publish", icon: Rocket },
];

const empty: WizardData = {
  product_type: "", name: "", headline: "", short_description: "", description: "",
  category: "", subcategory: "", tags: [],
  logo_url: "", banner_url: "", thumbnail_url: "", gallery: [], demo_video_url: "",
  preview_url: "", github_url: "", docs_url: "",
  billing_type: "one_time", price: 0, pricing_extra: {},
  features: [], requirements: [], version: "1.0.0", changelog: "",
  service_settings: {},
  community: { enabled: false },
  access: { method: "external_link", files: [], link: "", api_keys: "", instructions: "" },
  apps: ["Reviews","Support Tickets"],
  seo: {},
  status: "published",
  scheduled_at: null,
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
  const [launching, setLaunching] = useState<null | "saving" | "done">(null);

  const visibleSteps = useMemo(
    () => STEPS.filter(s => s.key !== "service" || data.product_type === "service"),
    [data.product_type]
  );
  const step = visibleSteps[stepIdx];
  const isLast = stepIdx === visibleSteps.length - 1;
  const isFirst = stepIdx === 0;

  const set = <K extends keyof WizardData>(k: K, v: WizardData[K]) =>
    setData(d => ({ ...d, [k]: v }));

  const canNext = (): boolean => {
    if (step.key === "type") return !!data.product_type;
    if (step.key === "basics") return !!data.name && !!data.headline;
    return true;
  };

  const next = () => {
    if (!canNext()) { toast.error("Please fill required fields"); return; }
    setStepIdx(i => Math.min(i + 1, visibleSteps.length - 1));
  };
  const prev = () => setStepIdx(i => Math.max(0, i - 1));

  const persist = async (status: WizardData["status"]) => {
    setSaving(true);
    const payload = {
      store_id: store.id,
      name: data.name,
      headline: data.headline || null,
      short_description: data.short_description || null,
      description: data.description || null,
      product_type: data.product_type || "digital",
      category: data.category || null,
      subcategory: data.subcategory || null,
      tags: data.tags,
      image_url: data.thumbnail_url || data.logo_url || null,
      logo_url: data.logo_url || null,
      banner_url: data.banner_url || null,
      thumbnail_url: data.thumbnail_url || null,
      gallery: data.gallery,
      demo_video_url: data.demo_video_url || null,
      preview_url: data.preview_url || null,
      github_url: data.github_url || null,
      docs_url: data.docs_url || null,
      billing_type: data.billing_type,
      price: Number(data.price ?? 0),
      pricing_extra: data.pricing_extra,
      benefits: data.features,
      features: data.features,
      requirements: data.requirements,
      apps: data.apps,
      community: data.community,
      access: data.access,
      service_settings: data.service_settings,
      seo: data.seo,
      version: data.version || null,
      changelog: data.changelog || null,
      status,
      scheduled_at: status === "scheduled" ? data.scheduled_at : null,
      active: status === "published",
    };
    const { error } = initial?.id
      ? await supabase.from("products").update(payload as any).eq("id", initial.id)
      : await supabase.from("products").insert(payload as any);
    setSaving(false);
    if (error) { toast.error(error.message); return false; }
    return true;
  };

  const publish = async (status: WizardData["status"]) => {
    if (!data.name) { toast.error("Product name required"); return; }
    if (status === "published") {
      setLaunching("saving");
      const ok = await persist(status);
      if (!ok) { setLaunching(null); return; }
      setLaunching("done");
      setTimeout(() => { onSaved(); onClose(); }, 1100);
      return;
    }
    const ok = await persist(status);
    if (ok) { toast.success(status === "draft" ? "Saved as draft" : "Scheduled"); onSaved(); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-white/5 bg-black/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 text-primary" />
              <span className="font-semibold">New Product</span>
              <span className="text-muted-foreground">· {store.name}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => publish("draft")} disabled={saving} className="text-xs rounded-full border border-white/10 px-3 py-1.5 hover:bg-white/5">Save draft</button>
              <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/5"><X className="size-4" /></button>
            </div>
          </div>
          {/* Progress rail */}
          <div className="max-w-6xl mx-auto px-6 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {visibleSteps.map((s, i) => {
                const Icon = s.icon;
                const done = i < stepIdx;
                const active = i === stepIdx;
                return (
                  <button
                    key={s.key}
                    onClick={() => setStepIdx(i)}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition border ${
                      active ? "bg-white text-black border-white" :
                      done ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/5" :
                      "border-white/10 text-muted-foreground hover:bg-white/5"
                    }`}
                  >
                    {done ? <Check className="size-3" /> : <Icon className="size-3.5" />}
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
          <StepHeader step={step} idx={stepIdx} total={visibleSteps.length} />
          <div className="mt-8">
            {step.key === "type" && <StepType data={data} set={set} onPick={() => setStepIdx(i => i+1)} />}
            {step.key === "basics" && <StepBasics data={data} set={set} />}
            {step.key === "branding" && <StepBranding data={data} set={set} store={store} />}
            {step.key === "pricing" && <StepPricing data={data} set={set} />}
            {step.key === "details" && <StepDetails data={data} set={set} />}
            {step.key === "service" && <StepService data={data} set={set} />}
            {step.key === "community" && <StepCommunity data={data} set={set} />}
            {step.key === "access" && <StepAccess data={data} set={set} />}
            {step.key === "apps" && <StepApps data={data} set={set} />}
            {step.key === "seo" && <StepSEO data={data} set={set} />}
            {step.key === "preview" && <StepPreview data={data} store={store} />}
            {step.key === "publish" && <StepPublish data={data} set={set} onPublish={publish} saving={saving} />}
          </div>
        </main>

        {/* Footer nav */}
        <footer className="sticky bottom-0 border-t border-white/5 bg-black/70 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
            <button onClick={prev} disabled={isFirst} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm disabled:opacity-30 hover:bg-white/5">
              <ChevronLeft className="size-4" /> Back
            </button>
            <div className="text-xs text-muted-foreground">Step {stepIdx+1} of {visibleSteps.length}</div>
            {!isLast ? (
              <button onClick={next} className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition">
                Continue <ChevronRight className="size-4" />
              </button>
            ) : (
              <button onClick={() => publish("published")} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black px-5 py-2 text-sm font-semibold">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />} Publish now
              </button>
            )}
          </div>
        </footer>
      </div>

      {launching && <LaunchOverlay phase={launching} name={data.name} />}
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
    short_description: anyP.short_description ?? "",
    description: p.description ?? "",
    category: p.category ?? "",
    subcategory: anyP.subcategory ?? "",
    tags: p.tags ?? [],
    logo_url: anyP.logo_url ?? "",
    banner_url: anyP.banner_url ?? "",
    thumbnail_url: anyP.thumbnail_url ?? "",
    gallery: anyP.gallery ?? [],
    demo_video_url: anyP.demo_video_url ?? "",
    preview_url: anyP.preview_url ?? "",
    github_url: anyP.github_url ?? "",
    docs_url: anyP.docs_url ?? "",
    billing_type: p.billing_type ?? "one_time",
    price: Number(p.price ?? 0),
    pricing_extra: anyP.pricing_extra ?? {},
    features: anyP.features ?? p.benefits ?? [],
    requirements: anyP.requirements ?? [],
    apps: anyP.apps ?? [],
    community: anyP.community ?? { enabled: false },
    access: anyP.access ?? { method: "external_link", files: [], link: "", api_keys: "", instructions: "" },
    service_settings: anyP.service_settings ?? {},
    seo: anyP.seo ?? {},
    version: anyP.version ?? "1.0.0",
    changelog: anyP.changelog ?? "",
    status: anyP.status ?? "published",
  };
}

/* ---------- shared atoms ---------- */
const Field = ({ label, hint, children }: any) => (
  <label className="block">
    <div className="text-xs font-medium mb-1.5 text-muted-foreground">{label}</div>
    {children}
    {hint && <div className="text-[10px] text-muted-foreground/70 mt-1">{hint}</div>}
  </label>
);
const Input = (p: any) => <input {...p} className={`w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition ${p.className??""}`} />;
const TextArea = (p: any) => <textarea {...p} className={`w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition min-h-[100px] ${p.className??""}`} />;
const Select = (p: any) => <select {...p} className={`w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/60 ${p.className??""}`} />;

function StepHeader({ step, idx, total }: { step: any; idx: number; total: number }) {
  const Icon = step.icon;
  const titles: Record<StepKey, [string, string]> = {
    type: ["What are you selling?", "Pick the type that best describes your product."],
    basics: ["The essentials", "A great headline sells the product before the price does."],
    branding: ["Make it look like a brand", "Upload visuals that customers will remember."],
    pricing: ["Set your price", "Choose how customers pay for access."],
    details: ["What's inside", "List the features that make this worth buying."],
    service: ["Service settings", "How you'll work with each customer."],
    community: ["Community access", "Optional — bundle a private space with this product."],
    access: ["How customers receive it", "Set up delivery so the experience is instant."],
    apps: ["Power-up apps", "Add modules to the product page like Whop does."],
    seo: ["Discovery", "Help people find you on search and the marketplace."],
    preview: ["Live preview", "Exactly how customers will see this."],
    publish: ["Ready to launch", "Final step — go live or schedule."],
  };
  const [title, sub] = titles[step.key as StepKey];
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted-foreground mb-4">
        <Icon className="size-3" /> Step {idx + 1} / {total}
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{sub}</p>
    </div>
  );
}

/* ---------- steps ---------- */
function StepType({ data, set, onPick }: any) {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {PRODUCT_TYPES.map(t => {
        const active = data.product_type === t.id;
        return (
          <button key={t.id} onClick={() => { set("product_type", t.id); setTimeout(onPick, 200); }}
            className={`text-left rounded-2xl border p-4 transition group ${active ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.03]"}`}>
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="font-medium text-sm">{t.label}</div>
            {active && <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400"><Check className="size-3" /> Selected</div>}
          </button>
        );
      })}
    </div>
  );
}

function StepBasics({ data, set }: any) {
  return (
    <div className="space-y-4">
      <Field label="Product name *"><Input value={data.name} onChange={(e:any)=>set("name", e.target.value)} placeholder="Nexus Security Scanner" /></Field>
      <Field label="Headline *" hint="One bold line. Keep it punchy."><Input value={data.headline} onChange={(e:any)=>set("headline", e.target.value)} placeholder="Build Production Ready AI Agents in Minutes" /></Field>
      <Field label="Short description" hint={`${data.short_description.length}/160`}>
        <Input maxLength={160} value={data.short_description} onChange={(e:any)=>set("short_description", e.target.value)} placeholder="The one-liner for cards and previews" />
      </Field>
      <Field label="Full description"><TextArea value={data.description} onChange={(e:any)=>set("description", e.target.value)} placeholder="Tell the whole story…" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category"><Input value={data.category} onChange={(e:any)=>set("category", e.target.value)} placeholder="Frontend Development" /></Field>
        <Field label="Subcategory"><Input value={data.subcategory} onChange={(e:any)=>set("subcategory", e.target.value)} placeholder="React Components" /></Field>
      </div>
      <Field label="Tags">
        <ChipInput value={data.tags} onChange={(v:string[])=>set("tags", v)} suggestions={SUGGESTED_TAGS} placeholder="Add a tag and press Enter" />
      </Field>
    </div>
  );
}

function ChipInput({ value, onChange, suggestions = [], placeholder }: any) {
  const [text, setText] = useState("");
  const add = (t: string) => { const v = t.trim(); if (!v) return; if (value.includes(v)) return; onChange([...value, v]); setText(""); };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {value.map((t: string) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs">
            {t}<button onClick={()=>onChange(value.filter((x:string)=>x!==t))}><X className="size-3 opacity-60 hover:opacity-100" /></button>
          </span>
        ))}
      </div>
      <Input value={text} onChange={(e:any)=>setText(e.target.value)} onKeyDown={(e:any)=>{ if(e.key==="Enter"||e.key===","){ e.preventDefault(); add(text);} }} placeholder={placeholder} />
      {suggestions.length>0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.filter((s:string)=>!value.includes(s)).slice(0,8).map((s:string)=>(
            <button key={s} onClick={()=>add(s)} className="text-[10px] rounded-full border border-white/10 px-2 py-0.5 text-muted-foreground hover:bg-white/5">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function StepBranding({ data, set, store }: any) {
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <UploadCard label="Product logo" hint="Square, 512×512+" value={data.logo_url} onUpload={(u: string)=>set("logo_url", u)} kind="product-logo" store={store} aspect="aspect-square" />
        <UploadCard label="Product banner" hint="Wide, 1600×600+" value={data.banner_url} onUpload={(u: string)=>set("banner_url", u)} kind="product-banner" store={store} aspect="aspect-[16/6]" />
      </div>
      <UploadCard label="Thumbnail" hint="Used on cards and discover" value={data.thumbnail_url} onUpload={(u: string)=>set("thumbnail_url", u)} kind="product-thumb" store={store} aspect="aspect-video" />

      <Field label="Gallery images">
        <div className="grid grid-cols-3 gap-2">
          {data.gallery.map((g: string, i: number) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
              <img src={g} className="absolute inset-0 w-full h-full object-cover" />
              <button onClick={()=>set("gallery", data.gallery.filter((_:any, idx:number)=>idx!==i))} className="absolute top-1 right-1 rounded-full bg-black/70 p-1"><X className="size-3" /></button>
            </div>
          ))}
          <UploadCard compact kind="product-gallery" store={store} onUpload={(u: string)=>set("gallery", [...data.gallery, u])} aspect="aspect-square" />
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Demo video URL"><Input value={data.demo_video_url} onChange={(e:any)=>set("demo_video_url", e.target.value)} placeholder="https://youtube.com/…" /></Field>
        <Field label="Live preview link"><Input value={data.preview_url} onChange={(e:any)=>set("preview_url", e.target.value)} placeholder="https://demo.yourapp.com" /></Field>
        <Field label="GitHub link"><Input value={data.github_url} onChange={(e:any)=>set("github_url", e.target.value)} placeholder="https://github.com/…" /></Field>
        <Field label="Documentation link"><Input value={data.docs_url} onChange={(e:any)=>set("docs_url", e.target.value)} placeholder="https://docs.yourapp.com" /></Field>
      </div>
    </div>
  );
}

function UploadCard({ label, hint, value, onUpload, kind, store, aspect = "aspect-video", compact = false }: any) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const onFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const url = await uploadStoreAsset(user!.id, file, kind);
      onUpload(url);
    } catch (e: any) { toast.error(e?.message ?? "Upload failed"); }
    setBusy(false);
  };
  return (
    <div>
      {label && <div className="text-xs font-medium mb-1.5 text-muted-foreground">{label}</div>}
      <button
        type="button"
        onClick={()=>ref.current?.click()}
        className={`relative w-full ${aspect} rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] overflow-hidden grid place-items-center hover:border-primary/40 transition group`}>
        {value ? (
          <img src={value} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="text-center text-muted-foreground">
            {busy ? <Loader2 className="size-5 animate-spin mx-auto" /> : <Upload className="size-5 mx-auto" />}
            {!compact && <div className="text-[10px] mt-1">Click to upload</div>}
          </div>
        )}
        {value && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition grid place-items-center">
            <span className="text-xs">Replace</span>
          </div>
        )}
      </button>
      {hint && <div className="text-[10px] text-muted-foreground/70 mt-1">{hint}</div>}
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e)=>onFile(e.target.files?.[0])} />
    </div>
  );
}

function StepPricing({ data, set }: any) {
  const models = [
    { id: "free", label: "Free", icon: "🎁" },
    { id: "one_time", label: "One-time Payment", icon: "💵" },
    { id: "monthly", label: "Monthly", icon: "📅" },
    { id: "yearly", label: "Yearly", icon: "🗓️" },
    { id: "custom", label: "Custom Pricing", icon: "🤝" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-2">
        {models.map(m => (
          <button key={m.id} onClick={()=>set("billing_type", m.id)}
            className={`rounded-xl border p-3 text-left text-sm transition ${data.billing_type===m.id ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"}`}>
            <div className="text-xl mb-1">{m.icon}</div>{m.label}
          </button>
        ))}
      </div>
      {data.billing_type !== "free" && data.billing_type !== "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (USD)"><Input type="number" min={0} value={data.price} onChange={(e:any)=>set("price", Number(e.target.value))} /></Field>
          <Field label="Discount (%)"><Input type="number" min={0} max={100} value={data.pricing_extra.discount ?? ""} onChange={(e:any)=>set("pricing_extra", { ...data.pricing_extra, discount: Number(e.target.value)||undefined })} /></Field>
          <Field label="Trial period (days)"><Input type="number" min={0} value={data.pricing_extra.trial_days ?? ""} onChange={(e:any)=>set("pricing_extra", { ...data.pricing_extra, trial_days: Number(e.target.value)||undefined })} /></Field>
          <Field label="Launch offer"><Input value={data.pricing_extra.launch_offer ?? ""} onChange={(e:any)=>set("pricing_extra", { ...data.pricing_extra, launch_offer: e.target.value })} placeholder="50% off for first 100 buyers" /></Field>
        </div>
      )}
    </div>
  );
}

function ListEditor({ items, onChange, placeholder, prefix = "✓ " }: any) {
  const [t, setT] = useState("");
  const add = () => { if (!t.trim()) return; onChange([...items, t.trim()]); setT(""); };
  return (
    <div className="space-y-2">
      {items.map((f: string, i: number) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
          <span className="text-emerald-400">{prefix}</span><span className="flex-1">{f}</span>
          <button onClick={()=>onChange(items.filter((_:any, idx:number)=>idx!==i))}><X className="size-3.5 opacity-60 hover:opacity-100" /></button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={t} onChange={(e:any)=>setT(e.target.value)} onKeyDown={(e:any)=>{ if(e.key==="Enter"){ e.preventDefault(); add(); } }} placeholder={placeholder} />
        <button onClick={add} className="rounded-lg border border-white/10 px-3 hover:bg-white/5"><Plus className="size-4" /></button>
      </div>
    </div>
  );
}

function StepDetails({ data, set }: any) {
  return (
    <div className="space-y-6">
      <Field label="Features" hint="Add unlimited features customers will get">
        <ListEditor items={data.features} onChange={(v:string[])=>set("features", v)} placeholder="Source Code Included" />
      </Field>
      <Field label="Requirements" hint="What customers need to use this">
        <ListEditor items={data.requirements} onChange={(v:string[])=>set("requirements", v)} placeholder="Node.js 20+" prefix="• " />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Version"><Input value={data.version} onChange={(e:any)=>set("version", e.target.value)} placeholder="1.0.0" /></Field>
        <Field label="Changelog"><Input value={data.changelog} onChange={(e:any)=>set("changelog", e.target.value)} placeholder="Initial release" /></Field>
      </div>
    </div>
  );
}

function StepService({ data, set }: any) {
  const s = data.service_settings;
  const update = (k: string, v: any) => set("service_settings", { ...s, [k]: v });
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Field label="Delivery time"><Input value={s.delivery_time ?? ""} onChange={(e:any)=>update("delivery_time", e.target.value)} placeholder="7 days" /></Field>
      <Field label="Revisions"><Input type="number" value={s.revisions ?? ""} onChange={(e:any)=>update("revisions", Number(e.target.value))} placeholder="3" /></Field>
      <Field label="Support duration"><Input value={s.support_duration ?? ""} onChange={(e:any)=>update("support_duration", e.target.value)} placeholder="30 days" /></Field>
      <Field label="Communication"><Select value={s.communication ?? ""} onChange={(e:any)=>update("communication", e.target.value)}>
        <option value="">Select…</option><option>Chat</option><option>Email</option><option>Video Call</option><option>In-app</option>
      </Select></Field>
      <Field label="Availability"><Input value={s.availability ?? ""} onChange={(e:any)=>update("availability", e.target.value)} placeholder="Mon–Fri, 9–18 UTC" /></Field>
      <Field label="Project size"><Select value={s.project_size ?? ""} onChange={(e:any)=>update("project_size", e.target.value)}>
        <option value="">Select…</option><option>Small</option><option>Medium</option><option>Large</option><option>Enterprise</option>
      </Select></Field>
    </div>
  );
}

function StepCommunity({ data, set }: any) {
  const c = data.community;
  const update = (patch: any) => set("community", { ...c, ...patch });
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={()=>update({ enabled: true })} className={`rounded-xl border p-4 text-left ${c.enabled ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"}`}>
          <Users className="size-5 mb-2" /><div className="font-medium text-sm">Yes, include community</div>
          <div className="text-xs text-muted-foreground">Bundle a private space</div>
        </button>
        <button onClick={()=>update({ enabled: false })} className={`rounded-xl border p-4 text-left ${!c.enabled ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"}`}>
          <X className="size-5 mb-2" /><div className="font-medium text-sm">No community</div>
          <div className="text-xs text-muted-foreground">Just the product</div>
        </button>
      </div>
      {c.enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(["create","existing"] as const).map(m => (
              <button key={m} onClick={()=>update({ mode: m })} className={`rounded-lg border p-3 text-sm ${c.mode===m ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"}`}>
                {m === "create" ? "Create new community" : "Select existing"}
              </button>
            ))}
          </div>
          {c.mode === "create" && <Field label="Community name"><Input value={c.name ?? ""} onChange={(e:any)=>update({ name: e.target.value })} placeholder="Nexus Insiders" /></Field>}
          <Field label="Access level">
            <div className="flex gap-2">
              {["Free","Paid","Premium"].map(l => (
                <button key={l} onClick={()=>update({ access_level: l })} className={`flex-1 rounded-lg border py-2 text-sm ${c.access_level===l ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"}`}>{l}</button>
              ))}
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

function StepAccess({ data, set }: any) {
  const a = data.access;
  const update = (patch: any) => set("access", { ...a, ...patch });
  const methods = [
    { id: "file_download", label: "File Download" }, { id: "external_link", label: "External Link" },
    { id: "invite_link", label: "Invite Link" }, { id: "api_key", label: "API Key" },
    { id: "license_key", label: "License Key" }, { id: "community_access", label: "Community Access" },
    { id: "manual", label: "Manual Delivery" },
  ];
  return (
    <div className="space-y-5">
      <Field label="Delivery method">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {methods.map(m => (
            <button key={m.id} onClick={()=>update({ method: m.id })} className={`rounded-lg border p-3 text-sm text-left ${a.method===m.id ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"}`}>{m.label}</button>
          ))}
        </div>
      </Field>
      {a.method !== "manual" && (
        <Field label={a.method === "api_key" ? "API keys / values" : "Download / access link"}>
          {a.method === "api_key"
            ? <TextArea value={a.api_keys} onChange={(e:any)=>update({ api_keys: e.target.value })} placeholder="One per line" />
            : <Input value={a.link} onChange={(e:any)=>update({ link: e.target.value })} placeholder="https://…" />}
        </Field>
      )}
      <Field label="Instructions to customer"><TextArea value={a.instructions} onChange={(e:any)=>update({ instructions: e.target.value })} placeholder="How to install / get started" /></Field>
    </div>
  );
}

function StepApps({ data, set }: any) {
  const toggle = (n: string) => set("apps", data.apps.includes(n) ? data.apps.filter((x:string)=>x!==n) : [...data.apps, n]);
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {AVAILABLE_APPS.map(n => {
        const on = data.apps.includes(n);
        return (
          <button key={n} onClick={()=>toggle(n)} className={`flex items-center justify-between rounded-lg border p-3 text-sm transition ${on ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 hover:bg-white/5"}`}>
            <span className="flex items-center gap-2"><Sparkles className={`size-4 ${on ? "text-emerald-400" : "text-muted-foreground"}`} />{n}</span>
            <span className={`size-4 rounded-full border ${on ? "bg-emerald-500 border-emerald-500" : "border-white/20"}`}>{on && <Check className="size-3 text-black m-auto" />}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepSEO({ data, set }: any) {
  const update = (patch: any) => set("seo", { ...data.seo, ...patch });
  return (
    <div className="space-y-3">
      <Field label="SEO title"><Input value={data.seo.title ?? ""} onChange={(e:any)=>update({ title: e.target.value })} placeholder={data.name} /></Field>
      <Field label="SEO description"><TextArea value={data.seo.description ?? ""} onChange={(e:any)=>update({ description: e.target.value })} placeholder={data.short_description} /></Field>
      <Field label="Keywords"><Input value={data.seo.keywords ?? ""} onChange={(e:any)=>update({ keywords: e.target.value })} placeholder="comma, separated, keywords" /></Field>
      <Field label="Search tags"><Input value={data.seo.tags ?? ""} onChange={(e:any)=>update({ tags: e.target.value })} placeholder="ai, agents, automation" /></Field>
      <Field label="Discover page category"><Input value={data.seo.discover_category ?? ""} onChange={(e:any)=>update({ discover_category: e.target.value })} placeholder="Developer Tools" /></Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!data.seo.featured} onChange={e=>update({ featured: e.target.checked })} />
        Request to be featured
      </label>
    </div>
  );
}

function StepPreview({ data, store }: any) {
  const price = data.billing_type === "free" ? "Free" : data.billing_type === "custom" ? "Custom" : `$${Number(data.price||0).toFixed(2)}`;
  const period = data.billing_type === "monthly" ? "/mo" : data.billing_type === "yearly" ? "/yr" : "";
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
      <div className="relative aspect-[16/6] bg-gradient-to-br from-primary/30 to-emerald-500/20">
        {data.banner_url && <img src={data.banner_url} className="absolute inset-0 w-full h-full object-cover" />}
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4 -mt-16">
          <div className="size-24 rounded-2xl border-4 border-black bg-black/60 overflow-hidden shrink-0 grid place-items-center">
            {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-cover" /> : <Package className="size-8 text-muted-foreground" />}
          </div>
          <div className="flex-1 mt-12">
            <div className="text-xs text-muted-foreground">{store.name} · {data.category || "Uncategorized"}</div>
            <h2 className="text-2xl font-semibold mt-0.5">{data.name || "Untitled product"}</h2>
            <p className="text-sm text-muted-foreground mt-1">{data.headline}</p>
          </div>
          <div className="text-right mt-12">
            <div className="text-2xl font-semibold">{price}<span className="text-sm text-muted-foreground">{period}</span></div>
            <button className="mt-2 rounded-full bg-emerald-500 text-black text-sm font-semibold px-4 py-1.5">Buy now</button>
          </div>
        </div>

        {data.short_description && <p className="mt-5 text-sm">{data.short_description}</p>}

        {data.features.length > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">What's included</div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {data.features.map((f:string,i:number)=>(
                <div key={i} className="text-sm flex items-center gap-2"><Check className="size-3.5 text-emerald-400" />{f}</div>
              ))}
            </div>
          </div>
        )}

        {data.apps.length > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Apps</div>
            <div className="flex flex-wrap gap-1.5">
              {data.apps.map((a:string)=>(<span key={a} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs">{a}</span>))}
            </div>
          </div>
        )}

        {data.gallery.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {data.gallery.map((g:string,i:number)=>(<img key={i} src={g} className="aspect-square w-full object-cover rounded-lg" />))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {data.preview_url && <a className="inline-flex items-center gap-1 hover:text-white" href={data.preview_url} target="_blank" rel="noreferrer"><Globe className="size-3" /> Live preview</a>}
          {data.github_url && <a className="inline-flex items-center gap-1 hover:text-white" href={data.github_url} target="_blank" rel="noreferrer"><Github className="size-3" /> GitHub</a>}
          {data.docs_url && <a className="inline-flex items-center gap-1 hover:text-white" href={data.docs_url} target="_blank" rel="noreferrer"><FileText className="size-3" /> Docs</a>}
          {data.demo_video_url && <a className="inline-flex items-center gap-1 hover:text-white" href={data.demo_video_url} target="_blank" rel="noreferrer"><Play className="size-3" /> Demo video</a>}
        </div>
      </div>
    </div>
  );
}

function StepPublish({ data, set, onPublish, saving }: any) {
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <button onClick={()=>onPublish("draft")} disabled={saving} className="rounded-2xl border border-white/10 p-6 text-left hover:bg-white/5">
        <FileText className="size-6 mb-2" /><div className="font-semibold">Save draft</div>
        <div className="text-xs text-muted-foreground mt-1">Keep working later. Not visible to anyone.</div>
      </button>
      <div className="rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-2"><Send className="size-5" /><div className="font-semibold">Schedule</div></div>
        <Input type="datetime-local" value={data.scheduled_at ?? ""} onChange={(e:any)=>set("scheduled_at", e.target.value)} />
        <button onClick={()=>onPublish("scheduled")} disabled={!data.scheduled_at || saving} className="mt-3 w-full rounded-full border border-white/10 py-2 text-sm hover:bg-white/5 disabled:opacity-40">Schedule launch</button>
      </div>
      <button onClick={()=>onPublish("published")} disabled={saving} className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-left hover:bg-emerald-500/20 transition group">
        <Rocket className="size-6 mb-2 text-emerald-400 group-hover:-translate-y-1 transition" />
        <div className="font-semibold">Publish now</div>
        <div className="text-xs text-muted-foreground mt-1">Goes live on your store, discover & marketplace.</div>
      </button>
    </div>
  );
}

/* ---------- launch overlay ---------- */
function LaunchOverlay({ phase, name }: { phase: "saving" | "done"; name: string }) {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/90 backdrop-blur-2xl">
      <style>{`
        @keyframes lo-pulse { 0%{ transform:scale(.7); opacity:.7 } 100%{ transform:scale(1.8); opacity:0 } }
        @keyframes lo-spin { to { transform: rotate(360deg) } }
      `}</style>
      <div className="relative size-64 grid place-items-center">
        {[0,1,2].map(i => (
          <div key={i} className="absolute inset-0 rounded-full border border-emerald-400/30" style={{ animation: `lo-pulse 2.2s ${i*0.4}s infinite ease-out` }} />
        ))}
        <div className="absolute inset-6 rounded-full" style={{
          background: "conic-gradient(from 0deg, transparent, rgba(16,185,129,.6), transparent)",
          animation: "lo-spin 1.6s linear infinite",
          mask: "radial-gradient(circle, transparent 60%, black 62%)",
          WebkitMask: "radial-gradient(circle, transparent 60%, black 62%)",
        }} />
        <div className="relative size-28 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-600/10 border border-emerald-400/30 grid place-items-center">
          {phase === "done" ? <Check className="size-12 text-emerald-300" /> : <Rocket className="size-12 text-white" />}
        </div>
      </div>
      <div className="absolute bottom-24 text-center">
        <div className="text-lg font-semibold">{phase === "done" ? "Live on Nexus" : "Publishing your product"}</div>
        <div className="text-sm text-muted-foreground mt-1">{phase === "done" ? `“${name}” is now available` : "Indexing, generating SEO, and going live…"}</div>
      </div>
    </div>
  );
}
