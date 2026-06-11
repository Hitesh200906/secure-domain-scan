import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase.js";
import { env } from "../lib/env.js";

const router = Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  full_name: z.string().min(1).max(120).optional(),
});

router.post("/signup", async (req, res) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, full_name } = parsed.data;
  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.FRONTEND_URL}/dashboard`,
      data: full_name ? { full_name } : undefined,
    },
  });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ user: data.user, session: data.session });
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabaseAdmin.auth.signInWithPassword(parsed.data);
  if (error) return res.status(401).json({ error: error.message });
  return res.json({ user: data.user, session: data.session });
});

router.post("/logout", async (req, res) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    await supabaseAdmin.auth.admin.signOut(token).catch(() => undefined);
  }
  return res.json({ ok: true });
});

const ForgotSchema = z.object({ email: z.string().email() });

router.post("/forgot-password", async (req, res) => {
  const parsed = ForgotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.FRONTEND_URL}/reset-password`,
  });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

// Google OAuth — start flow
router.get("/google", (_req, res) => {
  if (!env.GOOGLE_CLIENT_ID) return res.status(500).json({ error: "Google OAuth not configured" });
  const redirectUri = `${env.FRONTEND_URL.replace(/\/$/, "")}/auth/callback`;
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

export default router;
