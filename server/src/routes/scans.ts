import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAsUser } from "../lib/supabase.js";

const router = Router();

const ScanSchema = z.object({
  target_url: z.string().url().max(2048),
  scan_type: z.string().min(1).max(64).optional(),
  notes: z.string().max(2000).optional(),
});

router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = ScanSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb
    .from("scan_requests")
    .insert({ ...parsed.data, user_id: req.user!.id, status: "pending" })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ scan: data });
});

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb
    .from("scan_requests")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ scans: data });
});

export default router;
