import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Btn } from "@/components/business/primitives";
import { useState } from "react";
import { Settings as SettingsIcon, Palette, CreditCard, Shield, Globe2, Mail, Bell, Blocks, Code2, UserCog, Users2, Languages, Percent, Lock, ScrollText, HardDriveDownload, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/business/settings")({ component: SettingsPage });

const TABS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "domains", label: "Domains", icon: Globe2 },
  { id: "email", label: "Email", icon: Mail },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Blocks },
  { id: "developers", label: "Developers", icon: Code2 },
  { id: "roles", label: "Roles", icon: UserCog },
  { id: "team", label: "Team", icon: Users2 },
  { id: "localization", label: "Localization", icon: Languages },
  { id: "taxes", label: "Taxes", icon: Percent },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "audit", label: "Audit logs", icon: ScrollText },
  { id: "backup", label: "Backup", icon: HardDriveDownload },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
];

function SettingsPage() {
  const [tab, setTab] = useState("general");
  const current = TABS.find(t => t.id === tab)!;
  return (
    <div>
      <PageHeader title="Settings" description="Configure every aspect of your business workspace." />
      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
        <Panel className="p-2 h-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] transition ${tab===t.id?"bg-white/[0.06] text-white":"text-neutral-400 hover:bg-white/[0.03] hover:text-white"} ${t.id==="danger" && tab!==t.id?"text-red-400/70":""}`}>
              <t.icon className="size-3.5" />{t.label}
            </button>
          ))}
        </Panel>
        <Panel className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <current.icon className="size-4 text-neutral-400" />
            <h2 className="text-[15px] font-semibold">{current.label}</h2>
          </div>
          <p className="text-[13px] text-neutral-500 max-w-xl">
            This section will host the full {current.label.toLowerCase()} configuration surface. Existing settings continue to work through their dedicated pages.
          </p>
          <div className="mt-6 grid gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-4">
                <div className="h-3 w-32 rounded bg-white/[0.08]" />
                <div className="mt-2 h-2.5 w-64 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
          {tab === "danger" && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4">
              <div className="flex items-center gap-2 text-red-400"><AlertTriangle className="size-4" /><span className="text-[13px] font-medium">Irreversible actions</span></div>
              <p className="mt-1 text-[12px] text-red-300/70">Deleting your workspace, transferring ownership, or wiping data lives here.</p>
              <Btn variant="secondary" className="mt-3 border-red-500/30 text-red-300">Delete workspace</Btn>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
