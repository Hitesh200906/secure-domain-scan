import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/business";
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/business/create")({
  component: CreateStoreWizard,
});

const CATEGORIES = ["Trading", "Crypto", "AI & Tech", "Business", "Creator", "Education", "Faith", "Design", "Gaming", "Other"];

function CreateStoreWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  // Step 2
  const [themeColor, setThemeColor] = useState("#7c3aed");
  const [accentColor, setAccentColor] = useState("#22d3ee");
  // Step 3 first product
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("digital");
  const [productPrice, setProductPrice] = useState("29");
  const [billingType, setBillingType] = useState("one_time");
  const [productDescription, setProductDescription] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate({ to: "/login" });
      else setUserId(data.user.id);
    });
  }, [navigate]);

  useEffect(() => { if (!slug || slug === slugify(name.slice(0, -1))) setSlug(slugify(name)); }, [name]);

  const total = 4;
  const next = () => setStep((s) => Math.min(total, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canNext = () => {
    if (step === 1) return name.trim().length >= 2 && slug.trim().length >= 2;
    return true;
  };

  const submit = async () => {
    if (!userId) return;
    setSubmitting(true);
    const { data: store, error } = await supabase.from("stores").insert({
      owner_id: userId,
      name: name.trim(),
      slug: slugify(slug),
      description: description.trim() || null,
      category,
      website_url: website.trim() || null,
      logo_url: logoUrl.trim() || null,
      banner_url: bannerUrl.trim() || null,
      theme_color: themeColor,
      accent_color: accentColor,
    }).select().single();

    if (error || !store) {
      setSubmitting(false);
      toast.error(error?.message ?? "Could not create store. Slug may be taken.");
      return;
    }

    if (productName.trim()) {
      await supabase.from("products").insert({
        store_id: store.id,
        name: productName.trim(),
        description: productDescription.trim() || null,
        product_type: productType,
        price: Number(productPrice) || 0,
        billing_type: billingType,
      });
    }

    toast.success("Store created!");
    navigate({ to: "/business" });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs"><Sparkles className="size-3 text-primary" /> Create your store</div>
          <h1 className="mt-3 text-3xl font-semibold">Launch your business in minutes</h1>
          <p className="mt-2 text-sm text-muted-foreground">Step {step} of {total}</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i < step ? "bg-primary" : "bg-white/10"}`} />
          ))}
        </div>

        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Basic information</h2>
              <Field label="Store name"><input value={name} onChange={e=>setName(e.target.value)} className="input" placeholder="Acme Academy" /></Field>
              <Field label="URL slug" hint={`Your store will live at /${slug || "your-slug"}`}>
                <input value={slug} onChange={e=>setSlug(slugify(e.target.value))} className="input" placeholder="acme" />
              </Field>
              <Field label="Description"><textarea value={description} onChange={e=>setDescription(e.target.value)} className="input min-h-[88px]" placeholder="What does your store offer?" /></Field>
              <Field label="Category">
                <select value={category} onChange={e=>setCategory(e.target.value)} className="input">
                  {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Website (optional)"><input value={website} onChange={e=>setWebsite(e.target.value)} className="input" placeholder="https://" /></Field>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Logo URL (optional)"><input value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} className="input" placeholder="https://..." /></Field>
                <Field label="Banner URL (optional)"><input value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} className="input" placeholder="https://..." /></Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Branding</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Theme color"><input type="color" value={themeColor} onChange={e=>setThemeColor(e.target.value)} className="h-11 w-full rounded-lg bg-transparent border border-white/10" /></Field>
                <Field label="Accent color"><input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)} className="h-11 w-full rounded-lg bg-transparent border border-white/10" /></Field>
              </div>
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="h-32" style={{ background: `linear-gradient(135deg, ${themeColor}, ${accentColor})` }} />
                <div className="p-4 flex items-center gap-3">
                  <div className="size-12 rounded-xl -mt-10 border-2 border-background" style={{ background: themeColor }} />
                  <div>
                    <div className="font-semibold">{name || "Your store"}</div>
                    <div className="text-xs text-muted-foreground">/{slug || "slug"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Your first product</h2>
              <p className="text-sm text-muted-foreground">You can add more later. Skip by leaving the name blank.</p>
              <Field label="Product name"><input value={productName} onChange={e=>setProductName(e.target.value)} className="input" placeholder="Pro Membership" /></Field>
              <Field label="Description"><textarea value={productDescription} onChange={e=>setProductDescription(e.target.value)} className="input min-h-[80px]" /></Field>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Type">
                  <select value={productType} onChange={e=>setProductType(e.target.value)} className="input">
                    <option value="community">Community access</option>
                    <option value="digital">Digital product</option>
                    <option value="software">Software / SaaS</option>
                    <option value="membership">Membership</option>
                  </select>
                </Field>
                <Field label="Billing">
                  <select value={billingType} onChange={e=>setBillingType(e.target.value)} className="input">
                    <option value="one_time">One-time</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </Field>
                <Field label="Price (USD)"><input value={productPrice} onChange={e=>setProductPrice(e.target.value)} className="input" inputMode="decimal" /></Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payments</h2>
              <p className="text-sm text-muted-foreground">Payments are in mock mode right now. You can connect Stripe and PayPal later from Settings → Payouts.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 p-4">
                  <div className="text-sm font-medium">Stripe</div>
                  <div className="text-xs text-muted-foreground mt-1">Cards, Apple Pay, Google Pay</div>
                  <button className="mt-3 text-xs text-muted-foreground" disabled>Coming soon</button>
                </div>
                <div className="rounded-xl border border-white/10 p-4">
                  <div className="text-sm font-medium">PayPal</div>
                  <div className="text-xs text-muted-foreground mt-1">Global PayPal checkout</div>
                  <button className="mt-3 text-xs text-muted-foreground" disabled>Coming soon</button>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
                <div className="text-sm font-medium">Ready to launch</div>
                <div className="text-xs text-muted-foreground mt-1">You can edit anything later from your dashboard.</div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button onClick={back} disabled={step===1} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white disabled:opacity-30">
              <ChevronLeft className="size-4" /> Back
            </button>
            {step < total ? (
              <button onClick={next} disabled={!canNext()} className="inline-flex items-center gap-1 rounded-full bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-50">
                Continue <ChevronRight className="size-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Launch store
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`.input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:0.625rem;padding:0.6rem 0.8rem;color:white;font-size:0.875rem;outline:none}.input:focus{border-color:rgba(124,58,237,0.6)}`}</style>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}
