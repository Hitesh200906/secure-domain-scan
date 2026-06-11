import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase.js";

// Public, unauthenticated read of active pricing plans.
const router = Router();

router.get("/pricing", async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("pricing_plans")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ plans: data });
});

export default router;
