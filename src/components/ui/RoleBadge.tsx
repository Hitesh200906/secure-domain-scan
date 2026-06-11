import { BadgeCheck, Shield, ShieldCheck } from "lucide-react";
import type { AppRole } from "@/hooks/use-admin";

const cfg = {
  master_admin: {
    label: "MASTER ADMIN",
    Icon: BadgeCheck,
    cls: "bg-gradient-to-r from-rose-500 to-red-600 text-white border-red-400/40 shadow-[0_0_20px_-4px_oklch(0.65_0.22_25_/0.7)]",
  },
  super_admin: {
    label: "SUPER ADMIN",
    Icon: ShieldCheck,
    cls: "bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-300/50",
  },
  admin: {
    label: "ADMIN",
    Icon: Shield,
    cls: "bg-primary/15 text-primary border-primary/30",
  },
} as const;

export function RoleBadge({ role, size = "sm" }: { role: AppRole; size?: "sm" | "md" }) {
  if (!role || role === "user") return null;
  const c = cfg[role];
  if (!c) return null;
  const pad = size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]";
  const ic = size === "md" ? "size-3.5" : "size-3";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider border ${pad} ${c.cls}`}>
      <c.Icon className={ic} strokeWidth={2.5} />
      {c.label}
    </span>
  );
}
