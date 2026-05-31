import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity, BarChart3, CreditCard, LayoutDashboard, Search,
  Settings, ShieldCheck, ArrowUpRight, ScanSearch, User as UserIcon, LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Nexus Security" }] }),
  component: Dashboard,
});

type Scan = {
  id: string; target_url: string; status: string; score: number | null;
  findings_count: number | null; created_at: string; plan: string;
};

function Dashboard() {
  const { user } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [profile, setProfile] = useState<{ plan: string; credits: number; full_name: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("scan_requests").select("*").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setScans((data as Scan[]) ?? []));
    supabase.from("profiles").select("plan,credits,full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => data && setProfile(data));
  }, [user]);

  const completed = scans.filter((s) => s.status === "completed");
  const avgScore = completed.length ? Math.round(completed.reduce((a, s) => a + (s.score ?? 0), 0) / completed.length) : 0;
  const totalFindings = scans.reduce((a, s) => a + (s.findings_count ?? 0), 0);

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[oklch(0.04_0.008_220)]">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-primary" />
            <span className="text-[13px] font-semibold tracking-[0.2em]">NEXUS<span className="text-muted-foreground ml-1.5">SEC</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Overview" active />
          <SidebarLink to="/scan/new" icon={ScanSearch} label="New Scan" />
          <SidebarLink to="/profile" icon={UserIcon} label="Profile" />
          <SidebarLink to="/pricing" icon={CreditCard} label="Billing" />
          <SidebarLink to="/contact" icon={Settings} label="Support" />
        </nav>
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          <div className="glass rounded-2xl p-4">
            <div className="text-xs text-muted-foreground capitalize">{profile?.plan ?? "starter"} Plan</div>
            <div className="text-sm mt-1">{profile?.credits ?? 0} scans remaining</div>
            <Link to="/pricing" className="mt-3 block text-xs text-primary hover:underline">Upgrade plan →</Link>
          </div>
          <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-white hover:bg-white/[0.03] inline-flex items-center gap-2">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="text-xs text-muted-foreground">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}</div>
              <h1 className="text-xl font-medium tracking-tight">Overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/scan/new" className="rounded-full bg-white text-black px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5">
                <ScanSearch className="size-3.5" /> New Scan
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Avg. Security Score", value: avgScore || "—", glow: true },
              { label: "Open Findings", value: String(totalFindings) },
              { label: "Total Scans", value: String(scans.length) },
              { label: "Credits Left", value: String(profile?.credits ?? 0) },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }} className="glass rounded-2xl p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{k.label}</div>
                <div className={`mt-3 text-3xl font-semibold tracking-tight ${k.glow ? "text-gradient-accent" : "text-white"}`}>{k.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
              <div className="text-sm font-medium">Recent Scans</div>
              <Link to="/scan/new" className="text-xs text-muted-foreground hover:text-white inline-flex items-center gap-1">
                Start new <ArrowUpRight className="size-3" />
              </Link>
            </div>

            {scans.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="size-12 mx-auto rounded-full glass grid place-items-center text-primary">
                  <ScanSearch className="size-5" />
                </div>
                <div className="mt-4 text-sm">No scans yet</div>
                <p className="mt-1 text-xs text-muted-foreground">Run your first security scan in under 60 seconds.</p>
                <Link to="/scan/new" className="mt-5 inline-flex rounded-full bg-white text-black px-4 py-2 text-xs font-medium">Start your first scan</Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="text-left font-normal px-6 py-3">Target</th>
                    <th className="text-left font-normal py-3">Plan</th>
                    <th className="text-left font-normal py-3">Status</th>
                    <th className="text-left font-normal py-3">Score</th>
                    <th className="text-right font-normal px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-6 py-3.5 font-mono text-xs truncate max-w-[260px]">{r.target_url}</td>
                      <td className="py-3.5 text-xs capitalize text-muted-foreground">{r.plan}</td>
                      <td className="py-3.5">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full glass ${
                          r.status === "completed" ? "text-emerald-400"
                          : r.status === "running" ? "text-primary" : "text-muted-foreground"
                        }`}>{r.status}</span>
                      </td>
                      <td className="py-3.5 font-mono text-xs">{r.score != null ? `${r.score}/100` : "—"}</td>
                      <td className="px-6 py-3.5 text-right text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Risk Distribution</div>
                <BarChart3 className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Critical", val: Math.max(1, Math.floor(totalFindings * 0.1)), color: "oklch(0.65 0.22 25)" },
                  { label: "High", val: Math.max(1, Math.floor(totalFindings * 0.25)), color: "oklch(0.78 0.17 50)" },
                  { label: "Medium", val: Math.max(1, Math.floor(totalFindings * 0.35)), color: "oklch(0.85 0.16 90)" },
                  { label: "Low", val: Math.max(1, Math.floor(totalFindings * 0.3)), color: "oklch(0.75 0.13 180)" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{r.label}</span><span className="font-mono">{r.val}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, r.val * 8)}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ background: r.color }} className="h-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Activity</div>
                <Activity className="size-4 text-muted-foreground" />
              </div>
              <ul className="mt-4 space-y-4">
                {scans.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <div className="text-sm text-white/90">Scan {s.status} for {s.target_url}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(s.created_at).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
                {scans.length === 0 && <li className="text-xs text-muted-foreground">No recent activity</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, active }: { to: string; icon: typeof LayoutDashboard; label: string; active?: boolean }) {
  return (
    <Link to={to} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${active ? "bg-white/[0.06] text-white" : "text-muted-foreground hover:bg-white/[0.03] hover:text-white"}`}>
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
