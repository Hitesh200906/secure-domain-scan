import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAsUser } from "../lib/supabase.js";

const router = Router();

router.get("/profile", requireAuth, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb.from("profiles").select("*").eq("id", req.user!.id).maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ profile: data });
});

router.patch("/profile", requireAuth, async (req: AuthedRequest, res) => {
  const Patch = z.object({
    full_name: z.string().max(200).optional(),
    role_title: z.string().max(120).optional(),
    company: z.string().max(200).optional(),
  });
  const parsed = Patch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("profiles").update(parsed.data).eq("id", req.user!.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

export default router;
