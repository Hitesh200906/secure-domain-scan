import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, ShieldCheck, LifeBuoy,
  ScrollText, ChevronLeft, Menu, Loader2, Radar, ArrowUpRight, Tag,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useSecurityConsole } from "@/lib/security-console";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; superOnly?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/pricing", label: "Plans & Pricing", icon: Tag, superOnly: true },
  { to: "/admin/admins", label: "Admins", icon: ShieldCheck, superOnly: true },
  { to: "/admin/tickets", label: "Support", icon: LifeBuoy },
  { to: "/admin/logs", label: "Audit Logs", icon: ScrollText, superOnly: true },
];


/** Wrap superadmin-only pages: redirects normal admins back to /admin. */
export function SuperAdminGate({ children }: { children: ReactNode }) {
  const { isSuperAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isSuperAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, isSuperAdmin, navigate]);

  if (loading || !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  return <>{children}</>;
}

export function AdminShell({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { isSuperAdmin } = useAdmin();
  const { inConsole, openConsole } = useSecurityConsole();
  const visibleNav = nav.filter((item) => !item.superOnly || isSuperAdmin);

  // Inside the Nexefy Security overlay the console supplies its own chrome.
  if (inConsole) {
    return (
      <div>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{title}</h1>
            {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <aside className={`${open ? "block" : "hidden"} lg:block`}>
          <div className="glass-strong rounded-2xl p-3 sticky top-24">
            <div className="px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground flex items-center justify-between">
              <span>Admin Console</span>
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_oklch(0.75_0.15_150)]" />
            </div>
            <nav className="mt-1 space-y-0.5">
              {visibleNav.map((item) => {
                const active = item.exact ? path === item.to : path.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition ${
                      active ? "bg-white/[0.08] text-white border border-white/10" : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => { setOpen(false); openConsole(); }}
              className="group mt-3 flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent px-3 py-3 text-left transition hover:border-primary/50"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/30 bg-black/40">
                <Radar className="size-4 text-primary" />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-medium text-white">Nexefy Security</span>
                <span className="block text-[10px] text-muted-foreground">Scan · Pricing</span>
              </span>
              <ArrowUpRight className="size-3.5 text-primary/70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <div className="mt-3 px-3 py-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-primary/80">Restricted</div>
              <p className="text-[11px] mt-1 text-muted-foreground leading-relaxed">
                Admin access only. All actions are audited.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <button onClick={() => setOpen(!open)} className="lg:hidden mb-3 inline-flex items-center gap-2 text-xs glass px-3 py-2 rounded-full">
                {open ? <ChevronLeft className="size-3.5" /> : <Menu className="size-3.5" />} Menu
              </button>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">{title}</h1>
              {description && <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{description}</p>}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function StatCard({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: string; accent?: "primary" | "secondary" | "warn" | "ok" }) {
  const ring = {
    primary: "from-primary/20",
    secondary: "from-secondary/20",
    warn: "from-amber-400/20",
    ok: "from-emerald-400/20",
  }[accent ?? "primary"];
  return (
    <div className={`relative overflow-hidden glass rounded-2xl p-5`}>
      <div className={`absolute -top-16 -right-16 size-40 rounded-full blur-3xl bg-gradient-to-br ${ring} to-transparent`} />
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-medium tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium tracking-wide">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ok" | "warn" | "danger" | "info" }) {
  const map = {
    neutral: "bg-white/5 text-white/80 border-white/10",
    ok: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    warn: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    danger: "bg-rose-400/10 text-rose-300 border-rose-400/20",
    info: "bg-primary/10 text-primary border-primary/20",
  }[tone];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border ${map}`}>{children}</span>;
}
