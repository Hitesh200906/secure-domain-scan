import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "./login";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Nexus Security" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [mode, setMode] = useState<"request" | "set">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("set");
    }
  }, []);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email for the reset link");
  };

  const updatePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient -z-10" />
      <div className="w-full max-w-md glass-strong rounded-3xl p-6 sm:p-8">
        <Link to="/" className="flex items-center gap-2 mb-6 sm:mb-8">
          <ShieldCheck className="size-5 text-primary" />
          <span className="text-[13px] font-semibold tracking-[0.2em]">NEXUS<span className="text-muted-foreground ml-1.5">SECURITY</span></span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gradient">
          {mode === "request" ? "Reset password" : "Set new password"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "request" ? "We'll email you a secure reset link." : "Choose a new password for your account."}
        </p>

        {mode === "request" ? (
          <form onSubmit={sendLink} className="mt-7 space-y-3">
            <Input label="Email" type="email" value={email} onChange={setEmail} required />
            <button disabled={loading} className="w-full rounded-full bg-white text-black px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />} Send reset link
            </button>
          </form>
        ) : (
          <form onSubmit={updatePw} className="mt-7 space-y-3">
            <Input label="New password" type="password" value={password} onChange={setPassword} required />
            <button disabled={loading} className="w-full rounded-full bg-white text-black px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />} Update password
            </button>
          </form>
        )}

        <div className="mt-5 text-xs text-muted-foreground text-center">
          <Link to="/login" className="hover:text-white">← Back to login</Link>
        </div>
      </div>
    </div>
  );
}
