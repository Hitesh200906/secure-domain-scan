import { useEffect, useState } from "react";
import { ShieldAlert, LogOut, LifeBuoy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { setBanState, BAN_MESSAGE } from "@/lib/ban-state";

type BanInfo = { status: string; reason: string | null; at: string | null } | null;

/**
 * Watches the signed-in user's account status and renders a blocking notice
 * when the account has been banned or suspended by an administrator.
 */
export function BanGate() {
  const { user, loading } = useAuth();
  const [ban, setBan] = useState<BanInfo>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (!user?.id) {
        setBanState(false, null);
        if (!cancelled) setBan(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("status, ban_reason, banned_at")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      const blocked = data.status === "banned" || data.status === "suspended";
      setBanState(blocked, (data as { ban_reason: string | null }).ban_reason ?? null);
      setBan(
        blocked
          ? {
              status: data.status,
              reason: (data as { ban_reason: string | null }).ban_reason ?? null,
              at: (data as { banned_at: string | null }).banned_at ?? null,
            }
          : null,
      );
    };

    if (!loading) void check();
    const id = window.setInterval(() => void check(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user?.id, loading]);

  if (!ban) return null;

  const suspended = ban.status === "suspended";

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center px-4"
      style={{ background: "rgba(3,4,8,0.92)", backdropFilter: "blur(14px)" }}
      role="alertdialog"
      aria-modal="true"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0A0B10] p-8 text-center shadow-2xl">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-rose-400/20 bg-rose-500/10">
          <ShieldAlert className="size-6 text-rose-300" />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-white">
          {suspended ? "Account suspended" : "Account banned"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Your Nexefy account has been {suspended ? "suspended" : "permanently banned"} by our
          Trust &amp; Safety team. Access to the platform, your stores and all account features has
          been revoked.
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Reason</div>
          <p className="mt-1.5 text-sm text-white/85">
            {ban.reason?.trim() || "Violation of the Nexefy platform terms of service."}
          </p>
          {ban.at && (
            <div className="mt-3 text-[11px] text-white/40">
              Enforced on {new Date(ban.at).toLocaleDateString()}
            </div>
          )}
        </div>

        <p className="mt-4 text-[12px] text-white/45">{BAN_MESSAGE}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <a
            href="mailto:support@nexefy.com"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08] transition"
          >
            <LifeBuoy className="size-4" /> Contact support
          </a>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90 transition"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
