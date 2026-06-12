import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/business";
import { uploadStoreAsset } from "@/lib/uploads";
import {
  Check, ChevronLeft, ChevronRight, Loader2, Sparkles, Upload, X,
  Github, Linkedin, Globe, Twitter, MessagesSquare, ImageIcon, AtSign,
  Code2, Server, Layers, Brain, ShieldCheck, Cog, Cloud, Smartphone,
  Rocket, ExternalLink, BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/business/create")({ component: CreateStoreWizard });

const SKILL_OPTIONS = [
  { id: "frontend", label: "Frontend Development", icon: Code2 },
  { id: "backend", label: "Backend Development", icon: Server },
  { id: "fullstack", label: "Full Stack Development", icon: Layers },
  { id: "ai", label: "AI Development", icon: Brain },
  { id: "cybersecurity", label: "Cybersecurity", icon: ShieldCheck },
  { id: "devops", label: "DevOps", icon: Cog },
  { id: "saas", label: "SaaS", icon: Cloud },
  { id: "mobile", label: "Mobile Development", icon: Smartphone },
];

const STEPS = [
  "Name", "Username", "Logo", "Banner", "About", "Skills", "Socials", "Preview", "Publish",
];

function CreateStoreWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [socials, setSocials] = useState({
    github: "", linkedin: "", website: "", discord: "", x: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) navigate({ to: "/login" });
      else setUserId(data.user.id);
    });
  }, [navigate]);

  // Auto-derive slug from name until user edits it
  useEffect(() => { if (!slugTouched) setSlug(slugify(name)); }, [name, slugTouched]);

  // Slug availability check
  useEffect(() => {
    if (!slug || slug.length < 3) { setSlugAvailable(null); return; }
    setSlugChecking(true);
    const t = setTimeout(async () => {
      const { data } = await supabase.from("stores").select("id").eq("slug", slug).maybeSingle();
      setSlugAvailable(!data);
      setSlugChecking(false);
    }, 350);
    return () => clearTimeout(t);
  }, [slug]);

  const toggleSkill = (id: string) => {
    setSkills((s) => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleUpload = async (kind: "logo" | "banner", file: File) => {
    if (!userId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    const setLoading = kind === "logo" ? setLogoUploading : setBannerUploading;
    const setUrl = kind === "logo" ? setLogoUrl : setBannerUrl;
    setLoading(true);
    try {
      const url = await uploadStoreAsset(userId, file, kind);
      setUrl(url);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally { setLoading(false); }
  };

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1: return name.trim().length >= 2;
      case 2: return slug.length >= 3 && slugAvailable === true;
      case 5: return description.trim().length >= 20;
      case 6: return skills.length >= 1;
      default: return true;
    }
  }, [step, name, slug, slugAvailable, description, skills]);

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const [launching, setLaunching] = useState(false);
  const [launchPhase, setLaunchPhase] = useState<"idle" | "forging" | "done">("idle");

  const publish = async () => {
    if (!userId || submitting) return;
    setSubmitting(true);
    setLaunching(true);
    setLaunchPhase("forging");
    const social_links = Object.fromEntries(Object.entries(socials).filter(([_, v]) => v.trim()));
    const insertPromise = supabase.from("stores").insert({
      owner_id: userId,
      name: name.trim(),
      slug,
      description: description.trim() || null,
      category: skills[0] ? SKILL_OPTIONS.find(s => s.id === skills[0])?.label ?? null : null,
      skills: skills.map(id => SKILL_OPTIONS.find(s => s.id === id)?.label).filter(Boolean) as string[],
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
      website_url: socials.website.trim() || null,
      social_links: Object.keys(social_links).length ? social_links : null,
    });
    // Run animation + insert in parallel — minimum 1.8s of magic
    const [{ error }] = await Promise.all([
      insertPromise,
      new Promise((r) => setTimeout(r, 1800)),
    ]);
    if (error) {
      setSubmitting(false);
      setLaunching(false);
      setLaunchPhase("idle");
      toast.error(error.message);
      return;
    }
    setLaunchPhase("done");
    setTimeout(() => {
      navigate({ to: "/business/products", search: { new: 1 } as any });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      {/* Ambient gradient */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 size-[520px] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, #7c3aed, transparent 60%)" }} />
        <div className="absolute -bottom-40 -right-32 size-[520px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #22d3ee, transparent 60%)" }} />
      </div>

      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/business" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white">
            <ChevronLeft className="size-3.5" /> Back
          </Link>
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[11px]">
            <Sparkles className="size-3 text-primary" /> Launch your store
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Step {step} of {STEPS.length}</div>
            <div className="text-[11px] text-muted-foreground">{STEPS[step - 1]}</div>
          </div>
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < step ? "bg-gradient-to-r from-primary to-cyan-400" : "bg-white/10"}`} />
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6 sm:p-10 border border-white/10">
          {step === 1 && (
            <StepWrap title="What's your store called?" subtitle="This is the name developers and customers will see. You can change it later.">
              <Field>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Labs"
                  className="w-full bg-transparent text-2xl sm:text-3xl font-semibold outline-none placeholder:text-muted-foreground/50 border-b border-white/10 focus:border-primary pb-3"
                  maxLength={50}
                />
                <div className="mt-2 text-[11px] text-muted-foreground text-right">{name.length}/50</div>
              </Field>
            </StepWrap>
          )}

          {step === 2 && (
            <StepWrap title="Claim your username" subtitle="This becomes your store URL. Choose carefully.">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-primary transition">
                <div className="flex items-center px-4 py-3 gap-1">
                  <AtSign className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">nexus.app/</span>
                  <input
                    value={slug}
                    onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                    placeholder="your-handle"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 min-w-0"
                    maxLength={30}
                  />
                  <div className="shrink-0">
                    {slugChecking ? <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      : slug.length >= 3 && slugAvailable === true ? <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400"><Check className="size-3.5" /> Available</div>
                      : slug.length >= 3 && slugAvailable === false ? <div className="inline-flex items-center gap-1 text-[11px] text-rose-400"><X className="size-3.5" /> Taken</div>
                      : null}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Letters, numbers and dashes. 3–30 characters.</p>
            </StepWrap>
          )}

          {step === 3 && (
            <StepWrap title="Upload your logo" subtitle="A clean square logo (PNG or SVG). 5MB max.">
              <UploadCard
                shape="square"
                url={logoUrl}
                uploading={logoUploading}
                onFile={(f) => handleUpload("logo", f)}
                onClear={() => setLogoUrl("")}
              />
            </StepWrap>
          )}

          {step === 4 && (
            <StepWrap title="Add a banner" subtitle="A wide cover image shown at the top of your store. 5MB max.">
              <UploadCard
                shape="wide"
                url={bannerUrl}
                uploading={bannerUploading}
                onFile={(f) => handleUpload("banner", f)}
                onClear={() => setBannerUrl("")}
              />
            </StepWrap>
          )}

          {step === 5 && (
            <StepWrap title="Tell your story" subtitle="A short tagline and an about section that introduces you.">
              <Field label="Tagline">
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Ship faster. Sleep better." maxLength={80}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
              </Field>
              <Field label="About your store">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you build? Who is it for? What makes you different?" maxLength={500}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary min-h-[140px] resize-none" />
                <div className="mt-1 text-[11px] text-muted-foreground text-right">{description.length}/500</div>
              </Field>
            </StepWrap>
          )}

          {step === 6 && (
            <StepWrap title="What do you build?" subtitle="Pick everything that applies. This helps developers find you on Discover.">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SKILL_OPTIONS.map((s) => {
                  const active = skills.includes(s.id);
                  const Icon = s.icon;
                  return (
                    <button key={s.id} onClick={() => toggleSkill(s.id)}
                      className={`relative text-left p-4 rounded-xl border transition group ${active ? "border-primary bg-primary/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"}`}>
                      <Icon className={`size-5 mb-2 ${active ? "text-primary" : "text-muted-foreground group-hover:text-white"}`} />
                      <div className="text-[13px] font-medium leading-tight">{s.label}</div>
                      {active && <div className="absolute top-2 right-2 size-4 rounded-full bg-primary grid place-items-center"><Check className="size-2.5 text-primary-foreground" /></div>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">{skills.length} selected</div>
            </StepWrap>
          )}

          {step === 7 && (
            <StepWrap title="Connect your socials" subtitle="All optional — but they boost trust with buyers.">
              <SocialField icon={Github} label="GitHub" placeholder="github.com/you" value={socials.github} onChange={(v) => setSocials({ ...socials, github: v })} />
              <SocialField icon={Linkedin} label="LinkedIn" placeholder="linkedin.com/in/you" value={socials.linkedin} onChange={(v) => setSocials({ ...socials, linkedin: v })} />
              <SocialField icon={Globe} label="Website" placeholder="https://your-site.com" value={socials.website} onChange={(v) => setSocials({ ...socials, website: v })} />
              <SocialField icon={MessagesSquare} label="Discord" placeholder="discord.gg/invite" value={socials.discord} onChange={(v) => setSocials({ ...socials, discord: v })} />
              <SocialField icon={Twitter} label="X (Twitter)" placeholder="x.com/handle" value={socials.x} onChange={(v) => setSocials({ ...socials, x: v })} />
            </StepWrap>
          )}

          {step === 8 && (
            <StepWrap title="Preview your store" subtitle="This is roughly how it will look on Discover.">
              <PreviewCard
                name={name} slug={slug} tagline={tagline} description={description}
                logoUrl={logoUrl} bannerUrl={bannerUrl}
                skills={skills.map(id => SKILL_OPTIONS.find(s => s.id === id)?.label).filter(Boolean) as string[]}
                socials={socials}
              />
            </StepWrap>
          )}

          {step === 9 && (
            <StepWrap title="Ready to launch?" subtitle="Once published your store is live at the URL below.">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4">
                <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-cyan-400 grid place-items-center">
                  <Rocket className="size-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{name || "Your store"}</div>
                  <div className="text-xs text-muted-foreground truncate inline-flex items-center gap-1">
                    nexus.app/{slug} <ExternalLink className="size-3" />
                  </div>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Listed on Discover under your selected skills</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Ready to accept your first product</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Editable any time from your dashboard</li>
              </ul>
            </StepWrap>
          )}

          {/* Nav */}
          <div className="mt-10 flex items-center justify-between">
            <button onClick={back} disabled={step === 1}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white disabled:opacity-30 disabled:hover:text-muted-foreground">
              <ChevronLeft className="size-4" /> Back
            </button>
            {step < STEPS.length ? (
              <button onClick={next} disabled={!canAdvance}
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black">
                Continue <ChevronRight className="size-4" />
              </button>
            ) : (
              <button onClick={publish} disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-cyan-400 text-white px-6 py-2.5 text-sm font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition disabled:opacity-50">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                Publish store
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepWrap({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>}
      {children}
    </div>
  );
}

function SocialField({ icon: Icon, label, placeholder, value, onChange }: { icon: any; label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-primary px-4 py-2.5 transition">
      <Icon className="size-4 text-muted-foreground shrink-0" />
      <div className="text-xs text-muted-foreground w-20 shrink-0">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40 min-w-0" />
    </div>
  );
}

function UploadCard({ shape, url, uploading, onFile, onClear }: { shape: "square" | "wide"; url: string; uploading: boolean; onFile: (f: File) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const aspect = shape === "square" ? "aspect-square max-w-[240px]" : "aspect-[3/1] w-full";
  return (
    <div>
      <div className={`relative ${aspect} mx-auto rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] overflow-hidden group`}>
        {url ? (
          <>
            <img src={url} alt="" className="size-full object-cover" />
            <button onClick={onClear} className="absolute top-2 right-2 size-7 rounded-full bg-black/70 backdrop-blur grid place-items-center hover:bg-black">
              <X className="size-3.5 text-white" />
            </button>
          </>
        ) : (
          <button onClick={() => ref.current?.click()} disabled={uploading}
            className="absolute inset-0 grid place-items-center text-center hover:bg-white/[0.03] transition">
            {uploading ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : (
              <div>
                <div className="mx-auto size-10 rounded-xl bg-white/5 grid place-items-center mb-2">
                  {shape === "square" ? <ImageIcon className="size-5 text-muted-foreground" /> : <Upload className="size-5 text-muted-foreground" />}
                </div>
                <div className="text-sm font-medium">Click to upload</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, SVG · 5MB max</div>
              </div>
            )}
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
      {url && <button onClick={() => ref.current?.click()} className="mx-auto mt-3 block text-xs text-muted-foreground hover:text-white">Replace image</button>}
    </div>
  );
}

function PreviewCard({ name, slug, tagline, description, logoUrl, bannerUrl, skills, socials }: { name: string; slug: string; tagline: string; description: string; logoUrl: string; bannerUrl: string; skills: string[]; socials: Record<string, string> }) {
  const primaryCategory = skills[0];
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[oklch(0.06_0.008_220)] max-w-[460px] mx-auto">
      {/* Banner */}
      <div className="relative h-44 sm:h-52 overflow-hidden bg-gradient-to-br from-primary/40 via-fuchsia-700/30 to-cyan-400/30">
        {bannerUrl && <img src={bannerUrl} alt="" className="absolute inset-0 size-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="p-5">
        {/* Header: bigger logo + name + socials */}
        <div className="flex items-start gap-3">
          <div className="size-12 rounded-full bg-background overflow-hidden shrink-0 shadow-lg ring-1 ring-white/10">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="size-full grid place-items-center bg-gradient-to-br from-primary to-cyan-400 text-xl font-bold text-white">
                {(name[0] ?? "S").toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="font-semibold text-white truncate">{name || "Your store"}</div>
              <BadgeCheck className="size-4 text-sky-400 shrink-0" />
            </div>
            <div className="text-xs text-muted-foreground truncate">nexus.app/{slug || "your-handle"}</div>
          </div>
          {Object.values(socials).some(Boolean) && (
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              {socials.github && <span className="size-7 grid place-items-center rounded-full bg-white/5"><Github className="size-3.5" /></span>}
              {socials.linkedin && <span className="size-7 grid place-items-center rounded-full bg-white/5"><Linkedin className="size-3.5" /></span>}
              {socials.x && <span className="size-7 grid place-items-center rounded-full bg-white/5"><Twitter className="size-3.5" /></span>}
            </div>
          )}
        </div>

        {/* Tagline */}
        {tagline && <div className="mt-4 text-base font-semibold text-white">{tagline}</div>}

        {/* Description */}
        {description && <p className={`${tagline ? "mt-1.5" : "mt-4"} text-sm text-muted-foreground line-clamp-2 leading-relaxed`}>{description}</p>}

        {/* Footer: category + join */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {primaryCategory && (
              <span className="text-[11px] rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-white whitespace-nowrap">
                {primaryCategory}
              </span>
            )}
            {skills.length > 1 && (
              <span className="text-[11px] rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-1 text-muted-foreground">
                +{skills.length - 1}
              </span>
            )}
          </div>
          <button type="button" className="shrink-0 rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition">
            Join now
          </button>
        </div>
      </div>
    </div>
  );
}
