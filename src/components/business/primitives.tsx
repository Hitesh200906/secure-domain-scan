import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function PageHeader({
  title, description, actions, breadcrumb,
}: { title: string; description?: string; actions?: ReactNode; breadcrumb?: { label: string; to?: string }[] }) {
  return (
    <header className="mb-6 sm:mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-[11.5px] text-neutral-500 mb-2">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {b.to ? <Link to={b.to as any} className="hover:text-white transition">{b.label}</Link> : <span>{b.label}</span>}
                {i < breadcrumb.length - 1 && <span className="text-neutral-700">/</span>}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-white truncate">{title}</h1>
        {description && <p className="mt-1 text-[13.5px] text-neutral-500 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export function EmptyState({
  icon: Icon, title, description, action, accent = "text-neutral-500",
}: { icon: any; title: string; description?: string; action?: ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#111]/40 px-6 py-16 text-center">
      <div className={`mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-white/[0.03] border border-white/[0.06] ${accent}`}>
        <Icon className="size-6" />
      </div>
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      {description && <p className="mt-1.5 text-[13px] text-neutral-500 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/[0.06] bg-[#111] ${className}`}>{children}</div>;
}

export function SkeletonRow({ n = 4 }: { n?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-11 rounded-lg bg-white/[0.03] animate-pulse" />
      ))}
    </div>
  );
}

export function Btn({
  children, variant = "primary", onClick, to, size = "md", className = "", type,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "secondary";
  size?: "sm" | "md";
  onClick?: () => void;
  to?: string;
  className?: string;
  type?: "button" | "submit";
}) {
  const base = "inline-flex items-center gap-1.5 rounded-lg font-medium transition active:scale-[0.98]";
  const sz = size === "sm" ? "px-2.5 py-1 text-[12px]" : "px-3 py-1.5 text-[13px]";
  const map = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.09]",
    ghost: "text-neutral-400 hover:text-white hover:bg-white/[0.04]",
  } as const;
  const cls = `${base} ${sz} ${map[variant]} ${className}`;
  if (to) return <Link to={to as any} className={cls}>{children}</Link>;
  return <button type={type ?? "button"} onClick={onClick} className={cls}>{children}</button>;
}
