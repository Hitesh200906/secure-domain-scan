import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/auth-helpers";
import { Input, GoogleIcon } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Nexus Security" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);



  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/",
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to confirm your account");
    navigate({ to: "/login" });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const res = await signInWithGoogle("/");
    if (res.error) {
      setLoading(false);
      toast.error("Google sign-up failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient -z-10" />
      <div className="absolute inset-0 grid-bg opacity-30 -z-10" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong rounded-3xl p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <ShieldCheck className="size-5 text-primary" />
          <span className="text-[13px] font-semibold tracking-[0.2em]">
            NEXUS<span className="text-muted-foreground ml-1.5">SECURITY</span>
          </span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-gradient">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Start your first security scan in under a minute.</p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full glass px-4 py-3 text-sm font-medium hover:border-white/20 transition disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="flex-1 h-px bg-white/10" /> or <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <Input label="Full name" value={fullName} onChange={setFullName} required />
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Password" type="password" value={password} onChange={setPassword} required />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-white text-black px-4 py-3 text-sm font-medium hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />} Create account
          </button>
        </form>

        <div className="mt-5 text-xs text-muted-foreground text-center">
          Already have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
