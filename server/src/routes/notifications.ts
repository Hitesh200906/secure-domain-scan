import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAsUser } from "../lib/supabase.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ notifications: data });
});

export default router;
