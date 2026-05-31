import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Nexus Security" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    full_name: "",
    role_title: "",
    company: "",
    plan: "starter",
    credits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({
        full_name: data.full_name ?? "",
        role_title: data.role_title ?? "",
        company: data.company ?? "",
        plan: data.plan ?? "starter",
        credits: data.credits ?? 0,
      });
      setLoading(false);
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      role_title: profile.role_title,
      company: profile.company,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-5 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 hero-gradient -z-10 opacity-50" />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-white">← Back to dashboard</Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="size-16 rounded-full glass grid place-items-center text-2xl font-semibold text-primary">
            {(profile.full_name || user?.email || "?")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{profile.full_name || "Your profile"}</h1>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <PlanCard label="Plan" value={profile.plan.toUpperCase()} icon={<ShieldCheck className="size-4 text-primary" />} />
          <PlanCard label="Credits" value={String(profile.credits)} />
        </div>

        <form onSubmit={save} className="mt-10 space-y-4 glass-strong rounded-3xl p-8">
          <h2 className="text-xl font-semibold">Personal information</h2>
          <ProfileField label="Full name" value={profile.full_name} onChange={(v) => setProfile({ ...profile, full_name: v })} />
          <ProfileField label="Role / Title" value={profile.role_title} onChange={(v) => setProfile({ ...profile, role_title: v })} />
          <ProfileField label="Company" value={profile.company} onChange={(v) => setProfile({ ...profile, company: v })} />
          <button disabled={saving} className="mt-2 rounded-full bg-white text-black px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />} Save changes
          </button>
        </form>

        <div className="mt-8 glass rounded-3xl p-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Sign out</div>
            <div className="text-xs text-muted-foreground">End your session on this device.</div>
          </div>
          <button onClick={signOut} className="rounded-full glass px-4 py-2 text-sm inline-flex items-center gap-2 hover:border-destructive/40 hover:text-destructive transition">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2">{icon}{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gradient-accent">{value}</div>
    </div>
  );
}

function ProfileField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl bg-[oklch(0.06_0.008_220)] border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
