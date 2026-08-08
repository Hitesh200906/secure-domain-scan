import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import nexefyLogo from "@/assets/nexefy-logo.png";
import { useAdmin } from "@/hooks/use-admin";
import { hasAdminPasscode, verifyAdminPasscode } from "@/lib/auth-helpers";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Console — Nexefy Security" }, { name: "robots", content: "noindex" }] }),
  component: AdminGate,
});

function AdminGate() {
  const { user, isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnlocked(hasAdminPasscode());
    setReady(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
    } else if (!isAdmin) {
      navigate({ to: "/", replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || !ready || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!unlocked) {
    return <PasscodeScreen onUnlock={() => setUnlocked(true)} />;
  }

  return <Outlet />;
}

function PasscodeScreen({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPasscode(code)) {
      onUnlock();
    } else {
      setError("Incorrect passcode. Try again.");
      setCode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass-strong rounded-3xl p-8 text-center">
        <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center mb-4">
          <img src={nexefyLogo} alt="Nexefy" className="size-5 sm:size-6 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,.45))" }} />
        </div>
        <h1 className="text-lg font-medium tracking-tight">Admin Console</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter the admin passcode to continue.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="relative">
            <Lock className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(""); }}
              placeholder="Passcode"
              className="w-full pl-10 pr-4 py-3 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
            />
          </div>
          {error && <p className="text-xs text-rose-300">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-white text-black py-2.5 text-sm font-medium hover:bg-primary transition">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
