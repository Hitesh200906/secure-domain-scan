import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAsUser } from "../lib/supabase.js";

const router = Router();

router.get("/profile", requireAuth, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb.from("profiles").select("*").eq("id", req.user!.id).maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ profile: data });
});

export default router;
