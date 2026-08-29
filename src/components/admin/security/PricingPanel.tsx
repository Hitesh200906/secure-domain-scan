import { useEffect, useState } from "react";
import { AdminShell, Section, Badge } from "@/components/admin/AdminShell";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Save, Star } from "lucide-react";


type Plan = {
  id: string; slug: string; name: string; headline: string | null; description: string | null;
  price_monthly: number; price_label: string | null; credits: number;
  features: string[]; popular: boolean; cta_label: string | null; sort_order: number; active: boolean;
};

export function PricingPanel() {
  const [plans, setPlans] = useState<Plan[]>([]);

  const load = async () => {
    try {
      const { plans } = await api.admin.listPricing();
      setPlans((plans ?? []) as Plan[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (p: Plan) => {
    try {
      await api.admin.updatePricing(p.id, {
        name: p.name, headline: p.headline, description: p.description, price_monthly: p.price_monthly,
        price_label: p.price_label, credits: p.credits, features: p.features, popular: p.popular,
        cta_label: p.cta_label, active: p.active, sort_order: p.sort_order,
      });
      await logAudit("pricing.update", { type: "plan", id: p.slug });
      toast.success(`${p.name} saved — live on the website`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const saveAll = async () => {
    for (const p of plans) await save(p);
  };

  const togglePopular = async (p: Plan) => {
    // Optimistically update locally; persist via Save button (server-side uniqueness
    // for `popular` should be enforced in a future endpoint).
    setPlans((curr) => curr.map((x) => ({ ...x, popular: x.id === p.id })));
  };

  return (
    <AdminShell title="Plans" description="Edit plan names, pricing, copy and features. Changes go live across the whole website instantly.">
      <div className="mb-4 flex justify-end">
        <button onClick={saveAll} className="glass rounded-full px-4 py-2 text-xs inline-flex items-center gap-2">
          <Save className="size-3.5" /> Save all plans
        </button>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Section key={p.id} title={p.name} action={
            <div className="flex gap-2 items-center">
              {p.popular && <Badge tone="info">Popular</Badge>}
              {!p.active && <Badge tone="danger">Hidden</Badge>}
            </div>
          }>
            <div className="space-y-3 text-sm">
              <Field label="Name" v={p.name} on={(v) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, name: v } : x))} />
              <Field label="Headline" v={p.headline || ""} on={(v) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, headline: v } : x))} />
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Description</label>
                <textarea value={p.description || ""} rows={2} onChange={(e) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, description: e.target.value } : x))}
                  className="mt-1.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Price (credits)" v={String(p.price_monthly)} on={(v) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, price_monthly: Number(v) || 0 } : x))} />
                <Field label="Price label" v={p.price_label || ""} on={(v) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, price_label: v } : x))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Credits / month" v={String(p.credits)} on={(v) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, credits: Number(v) || 0 } : x))} />
                <Field label="Display order" v={String(p.sort_order)} on={(v) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, sort_order: Number(v) || 0 } : x))} />
              </div>
              <Field label="CTA label" v={p.cta_label || ""} on={(v) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, cta_label: v } : x))} />
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Features (one per line)</label>
                <textarea value={p.features.join("\n")} rows={5} onChange={(e) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, features: e.target.value.split("\n").filter(Boolean) } : x))}
                  className="mt-1.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-[12px] resize-none" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => togglePopular(p)} className={`flex-1 text-xs py-2 rounded-lg border inline-flex items-center justify-center gap-1.5 ${p.popular ? "bg-primary text-primary-foreground border-primary" : "glass"}`}>
                  <Star className="size-3" /> {p.popular ? "Popular" : "Mark popular"}
                </button>
                <label className="flex-1 text-xs glass rounded-lg py-2 flex items-center justify-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={p.active} onChange={(e) => setPlans((c) => c.map((x) => x.id === p.id ? { ...x, active: e.target.checked } : x))} />
                  Active
                </label>
              </div>
              <button onClick={() => save(p)} className="w-full bg-white text-black rounded-full py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2">
                <Save className="size-3.5" /> Save plan
              </button>
            </div>
          </Section>
        ))}
      </div>
    </AdminShell>
  );
}

function Field({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <input value={v} onChange={(e) => on(e.target.value)} className="mt-1.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
