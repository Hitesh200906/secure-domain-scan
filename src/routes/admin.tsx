import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, KeyRound, Loader2, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import nexefyLogo from "@/assets/nexefy-logo.png";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { hasAdminPasscode, verifyAdminPasscode, signInWithGoogle } from "@/lib/auth-helpers";
import { api } from "@/lib/api-client";
import { SecurityConsoleProvider } from "@/lib/security-console";
import { SecurityConsoleOverlay } from "@/components/admin/SecurityConsole";

/** The console owner signs in with the master passcode; every other admin uses an issued API key. */
export const OWNER_EMAIL = "hitesh.tanwar8318@gmail.com";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Console — Nexefy Security" }, { name: "robots", content: "noindex" }] }),
  component: AdminGate,
});

const UNLOCK_KEY = "nexus_admin_unlocked";

function AdminGate() {
  const { user, isAdmin, loading } = useAdmin();
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnlocked(hasAdminPasscode());
    setReady(true);
  }, []);

  if (loading || !ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  // Step 1 — identity. Google account chooser, nothing else on the page.
  if (!user) return <IdentityScreen />;

  // Step 2 — authorization. Accounts not registered in the console are rejected.
  if (!isAdmin) return <UnauthorizedScreen email={user.email ?? ""} />;

  // Step 3 — credential. Owner enters the master passcode, other admins their API key.
  if (!unlocked) {
    const isOwner = (user.email ?? "").toLowerCase() === OWNER_EMAIL;
    return <CredentialScreen isOwner={isOwner} email={user.email ?? ""} onUnlock={() => setUnlocked(true)} />;
  }


  return (
    <SecurityConsoleProvider>
      <Outlet />
      <SecurityConsoleOverlay />
    </SecurityConsoleProvider>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass-strong rounded-3xl p-8 text-center">
        <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 grid place-items-center mb-4">
          <img
            src={nexefyLogo}
            alt="Nexefy"
            className="size-5 sm:size-6 object-contain"
            style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,.45))" }}
          />
        </div>
        {children}
      </div>
    </div>
  );
}

function IdentityScreen() {
  const [busy, setBusy] = useState(false);

  const google = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle("/admin", { forceAccountChooser: true });
    if (error) {
      toast.error(error.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0a0a0a] px-8 py-12 text-center">
        <img
          src={nexefyLogo}
          alt="Nexefy"
          className="mx-auto size-12 object-contain"
          style={{ filter: "drop-shadow(0 0 14px rgba(37,99,235,.35))" }}
        />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">Nexefy</h1>
        <p className="mt-2 text-sm text-white/50">Sign in to continue to the Admin Console.</p>

        <button
          onClick={google}
          disabled={busy}
          className="mt-9 inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-[#141414] py-4 text-base font-medium text-white transition-colors duration-300 hover:bg-[#1c1c1c] disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <GoogleMark />}
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function UnauthorizedScreen({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);

  const switchAccount = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    const { error } = await signInWithGoogle("/admin", { forceAccountChooser: true });
    if (error) {
      toast.error(error.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0a0a0a] px-8 py-12 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-rose-500/25 bg-rose-500/10">
          <ShieldAlert className="size-6 text-rose-400" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-white">Access denied</h1>
        <p className="mt-2 text-sm text-white/50">
          You do not have authorized access to the Admin Console.
        </p>
        <div className="mt-4 truncate rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/60">
          {email}
        </div>
        <button
          onClick={switchAccount}
          disabled={busy}
          className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/12 bg-[#141414] py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#1c1c1c] disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <GoogleMark />}
          Use a different Google account
        </button>
        <a href="/" className="mt-3 inline-block text-[12px] text-white/45 transition hover:text-white">
          Back to Nexefy
        </a>
      </div>
    </div>
  );
}

function CredentialScreen({
  isOwner, email, onUnlock,
}: {
  isOwner: boolean;
  email: string;
  onUnlock: () => void;
}) {

  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isOwner) {
      if (verifyAdminPasscode(value)) return onUnlock();
      setError("Incorrect passcode. Try again.");
      setValue("");
      return;
    }
    setBusy(true);
    try {
      const ok = await api.admin.verifyAdminApiKey(value.trim());
      if (!ok) {
        setError("That API key is not valid for this account.");
        setValue("");
        return;
      }
      try { sessionStorage.setItem(UNLOCK_KEY, "1"); } catch { /* ignore */ }
      onUnlock();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <h1 className="text-lg font-medium tracking-tight">{isOwner ? "Owner passcode" : "Admin API key"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isOwner
          ? "Enter the master passcode to open the console."
          : "Enter the API key issued to you by the console owner."}
      </p>
      <div className="mt-4 truncate rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/60">{email}</div>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <div className="relative">
          {isOwner ? (
            <Lock className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          ) : (
            <KeyRound className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(""); }}
            placeholder={isOwner ? "Passcode" : "nxf_…"}
            className="w-full pl-10 pr-4 py-3 text-sm bg-white/[0.04] border border-white/10 rounded-xl focus:outline-none focus:border-primary/50"
          />
        </div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={busy || !value}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-medium text-black transition hover:bg-primary hover:text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Unlock console
        </button>
        <button
          type="button"
          onClick={() => { void supabase.auth.signOut(); }}
          className="inline-flex w-full items-center justify-center gap-2 py-1 text-[12px] text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" /> Sign in with a different account
        </button>
      </form>
    </Shell>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.6z" />
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 019.6 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.4-5.5l-7.6-5.9c-2.1 1.4-4.8 2.3-7.8 2.3-6.3 0-11.7-3.7-13.6-9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
