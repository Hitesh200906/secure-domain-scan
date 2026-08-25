import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

import { motion } from "framer-motion";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import nexefyLogo from "@/assets/nexefy-logo.png";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/auth-helpers";
import { Input, GoogleIcon } from "./login";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Nexefy Security" }] }),
  component: SignupPage,
});

const PENDING_KEY = "nexefy_signup_pending_email";

function SignupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"details" | "verify">("details");
  const [code, setCode] = useState("");

  const goToFeatures = () => {
    try {
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      /* ignore */
    }
    navigate({ to: "/", hash: "features" });
  };

  // Returning from the email confirmation link: a session now exists and a
  // pending signup flag is set → onboarding is complete, go to features.
  useEffect(() => {
    if (!user) return;
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_KEY);
    } catch {
      /* ignore */
    }
    if (pending && pending === user.email) {
      toast.success("Email verified — welcome to Nexefy");
      goToFeatures();
    } else {
      navigate({ to: "/", replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/signup",
        data: { full_name: fullName },
      },
    });
    setLoading(false);

    if (error) {
      if (/already registered|already exists|user already/i.test(error.message)) {
        return toast.error("An account already exists with this Gmail — please use another Gmail.");
      }
      return toast.error(error.message);
    }

    // With email confirmation enabled the backend returns a fake user object
    // (empty identities) when the address is already registered.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return toast.error("An account already exists with this Gmail — please use another Gmail.");
    }

    try {
      sessionStorage.setItem(PENDING_KEY, email.toLowerCase());
    } catch {
      /* ignore */
    }
    setStep("verify");
    toast.success(`Verification code sent to ${email}`);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return toast.error("Enter the 6-digit code from your email.");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Email verified — welcome to Nexefy");
    goToFeatures();
  };

  const handleResend = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Verification code re-sent");
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
      <button
        onClick={() => {
          if (step === "verify") {
            setStep("details");
            setCode("");
            return;
          }
          if (window.history.length > 1) window.history.back();
          else navigate({ to: "/" });
        }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground hover:text-white hover:border-white/20 transition"
        aria-label="Go back"
      >
        <ArrowLeft className="size-3.5" /> Back
      </button>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong rounded-3xl p-6 sm:p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-6 sm:mb-8">
          <img src={nexefyLogo} alt="Nexefy" className="size-5 sm:size-6 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,.45))" }} />
          <span className="text-[13px] font-semibold tracking-[0.2em]">
            NEXEFY<span className="text-muted-foreground ml-1.5">SECURITY</span>
          </span>
        </Link>

        {step === "details" ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gradient">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Start your first security scan in under a minute.</p>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full glass px-4 py-3 text-sm font-medium hover:border-white/20 transition disabled:opacity-50"
            >
              <GoogleIcon /> Continue with Google
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
          </>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-2xl glass">
              <MailCheck className="size-5 text-white" />
            </div>
            <h1 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-gradient">Verify your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a 6-digit verification code to <span className="text-white">{email}</span>.
              Enter it below — or click the confirmation link in the email.
            </p>

            <div className="mt-7 flex justify-center" dir="ltr">
              <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="mt-6 w-full rounded-full bg-white text-black px-4 py-3 text-sm font-medium hover:shadow-[0_0_40px_-4px_oklch(0.86_0.16_200_/0.7)] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />} Verify & create account
            </button>

            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <button onClick={handleResend} disabled={loading} className="hover:text-white disabled:opacity-50">
                Resend code
              </button>
              <button onClick={() => { setStep("details"); setCode(""); }} className="hover:text-white">
                Use a different email
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
