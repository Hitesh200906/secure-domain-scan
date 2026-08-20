import { ArrowLeft, ScanLine, Tags, X } from "lucide-react";
import { InSecurityConsole, useSecurityConsole, type SecuritySection } from "@/lib/security-console";
import { useAdmin } from "@/hooks/use-admin";
import { ScansPanel } from "@/components/admin/security/ScansPanel";
import { PricingPanel } from "@/components/admin/security/PricingPanel";

const items: { id: SecuritySection; label: string; icon: typeof ScanLine; superOnly?: boolean }[] = [
  { id: "scan", label: "Scan", icon: ScanLine },
  { id: "pricing", label: "Pricing", icon: Tags, superOnly: true },
];

/** Full-screen Nexefy Security workspace layered over the admin console. */
export function SecurityConsoleOverlay() {
  const { open, section, setSection, closeConsole } = useSecurityConsole();
  const { isSuperAdmin } = useAdmin();
  if (!open) return null;

  const nav = items.filter((i) => !i.superOnly || isSuperAdmin);
  const active = nav.some((i) => i.id === section) ? section : "scan";

  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto bg-[#050507]">
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[248px_1fr]">
        {/* Console sidebar */}
        <aside>
          <div className="sticky top-6 rounded-2xl border border-white/10 bg-[#0a0a0f] p-3">
            <div className="flex items-center justify-between px-2 py-1.5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Nexefy</div>
                <div className="text-[13px] font-medium text-white">Security</div>
              </div>
              <span className="size-1.5 rounded-full bg-emerald-400" />
            </div>

            <nav className="mt-3 space-y-0.5">
              {nav.map((item) => {
                const on = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${
                      on ? "border border-white/10 bg-white/[0.08] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={closeConsole}
              className="mt-3 flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-[13px] text-white/60 transition hover:text-white"
            >
              <ArrowLeft className="size-4" /> Back to Admin Console
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={closeConsole}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-[12px] text-white/65 transition hover:text-white"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <button
              onClick={closeConsole}
              aria-label="Close Nexefy Security"
              className="grid size-9 place-items-center rounded-full border border-white/10 text-white/60 transition hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <InSecurityConsole>
            {active === "scan" && <ScansPanel />}
            {active === "pricing" && <PricingPanel />}
          </InSecurityConsole>
        </main>
      </div>
    </div>
  );
}
