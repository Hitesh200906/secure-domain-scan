import { useStore } from "@/lib/store-context";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/lib/business";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/business/store")({ component: StoreSettings });

function StoreSettings() {
  const store = useStore();
  const [f, setF] = useState({
    name: store.name, description: store.description ?? "", category: store.category ?? "",
    website_url: store.website_url ?? "", logo_url: store.logo_url ?? "", banner_url: store.banner_url ?? "",
    theme_color: store.theme_color ?? "#7c3aed", accent_color: store.accent_color ?? "#22d3ee",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("stores").update(f).eq("id", store.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Store updated");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Store</h1>
          <p className="text-sm text-muted-foreground mt-1">Public storefront details.</p>
        </div>
        <a href={`/${store.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white">View public store <ExternalLink className="size-4"/></a>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <Field label="Name"><input className="input" value={f.name} onChange={e=>setF({...f,name:e.target.value})} /></Field>
        <Field label="Description"><textarea className="input min-h-[88px]" value={f.description} onChange={e=>setF({...f,description:e.target.value})} /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Category"><input className="input" value={f.category} onChange={e=>setF({...f,category:e.target.value})} /></Field>
          <Field label="Website"><input className="input" value={f.website_url} onChange={e=>setF({...f,website_url:e.target.value})} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Logo URL"><input className="input" value={f.logo_url} onChange={e=>setF({...f,logo_url:e.target.value})} /></Field>
          <Field label="Banner URL"><input className="input" value={f.banner_url} onChange={e=>setF({...f,banner_url:e.target.value})} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Theme color"><input type="color" className="h-11 w-full rounded-lg bg-transparent border border-white/10" value={f.theme_color} onChange={e=>setF({...f,theme_color:e.target.value})} /></Field>
          <Field label="Accent color"><input type="color" className="h-11 w-full rounded-lg bg-transparent border border-white/10" value={f.accent_color} onChange={e=>setF({...f,accent_color:e.target.value})} /></Field>
        </div>
        <button onClick={save} disabled={saving} className="rounded-full bg-white text-black px-5 py-2 text-sm font-medium">{saving ? "Saving…" : "Save changes"}</button>
      </div>

      <style>{`.input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:0.625rem;padding:0.55rem 0.75rem;color:white;font-size:0.875rem;outline:none}.input:focus{border-color:rgba(124,58,237,0.6)}`}</style>
    </div>
  );
}

function Field({ label, children }: any) {
  return <label className="block"><div className="text-xs font-medium mb-1.5">{label}</div>{children}</label>;
}
