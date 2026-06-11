import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAsUser, supabaseAdmin } from "../lib/supabase.js";

const router = Router();

// All admin routes require an authenticated user whose role is 'admin'
// in public.user_roles. RLS on the underlying tables enforces this too,
// but we short-circuit early to return clean 403s.
async function requireAdmin(req: AuthedRequest, res: any, next: any) {
  const { data, error } = await supabaseAdmin.rpc("has_role", {
    _user_id: req.user!.id,
    _role: "admin",
  });
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(403).json({ error: "Forbidden" });
  next();
}

// ---- Users / profiles ----
router.get("/users", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ users: data });
});

router.patch("/users/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const Patch = z.object({
    plan: z.string().max(64).optional(),
    status: z.string().max(32).optional(),
    credits: z.number().int().min(0).max(1_000_000).optional(),
    full_name: z.string().max(200).optional(),
  });
  const parsed = Patch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("profiles").update(parsed.data).eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

// ---- Scan requests (admin view of all; optional ?user_id= filter) ----
router.get("/scans", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const userId = typeof req.query.user_id === "string" ? req.query.user_id : null;
  let q = sb.from("scan_requests").select("*").order("created_at", { ascending: false });
  if (userId) q = q.eq("user_id", userId);
  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ scans: data });
});

router.patch("/scans/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const Patch = z.object({ status: z.string().max(32).optional(), notes: z.string().max(5000).optional() });
  const parsed = Patch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("scan_requests").update(parsed.data).eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

router.delete("/scans/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("scan_requests").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

// ---- Reports ----
router.get("/reports", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb.from("reports").select("*").order("created_at", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ reports: data });
});

router.post("/reports", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const Body = z.object({
    scan_id: z.string().uuid().optional(),
    user_id: z.string().uuid(),
    title: z.string().min(1).max(300),
    file_url: z.string().url().max(2048).optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb.from("reports").insert(parsed.data).select().single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ report: data });
});

router.delete("/reports/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("reports").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

// ---- Support tickets (admin view + reply) ----
router.get("/tickets", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb.from("support_tickets").select("*").order("created_at", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ tickets: data });
});

router.get("/tickets/:id/messages", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", req.params.id)
    .order("created_at");
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ messages: data });
});

router.post("/tickets/:id/reply", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const Body = z.object({ body: z.string().min(1).max(5000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { data: ticket } = await sb.from("support_tickets").select("user_id").eq("id", req.params.id).maybeSingle();
  await sb.from("ticket_messages").insert({
    ticket_id: req.params.id,
    author_type: "admin",
    author_name: req.user!.email ?? "admin",
    body: parsed.data.body,
  });
  await sb.from("support_tickets").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", req.params.id);
  if (ticket?.user_id) {
    await sb.from("notifications").insert({
      user_id: ticket.user_id,
      title: "Support replied",
      body: parsed.data.body.slice(0, 120),
      link: "/profile",
    });
  }
  return res.json({ ok: true });
});

// ---- Pricing plans ----
router.get("/pricing", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb.from("pricing_plans").select("*").order("sort_order");
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ plans: data });
});

router.patch("/pricing/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const Patch = z.object({
    name: z.string().max(200).optional(),
    price_monthly: z.number().min(0).max(1_000_000).optional(),
    active: z.boolean().optional(),
    popular: z.boolean().optional(),
    sort_order: z.number().int().optional(),
  });
  const parsed = Patch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("pricing_plans").update(parsed.data).eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

// ---- Admins table (role grants) ----
router.get("/admins", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb.from("admins").select("*").order("created_at");
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ admins: data });
});

router.post("/admins", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const Body = z.object({
    email: z.string().email(),
    full_name: z.string().max(200).optional(),
    role: z.enum(["admin", "super_admin"]).default("admin"),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb
    .from("admins")
    .insert({
      ...parsed.data,
      permissions: parsed.data.role === "super_admin" ? ["*"] : ["users.read", "tickets.respond"],
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ admin: data });
});

router.patch("/admins/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const Patch = z.object({ active: z.boolean().optional(), role: z.string().max(40).optional() });
  const parsed = Patch.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("admins").update(parsed.data).eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

router.delete("/admins/:id", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("admins").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ ok: true });
});

// ---- Audit logs ----
router.get("/audit", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ logs: data });
});

router.post("/audit", requireAuth, async (req: AuthedRequest, res) => {
  // any authenticated user may write an audit entry about themselves
  const Body = z.object({
    action: z.string().min(1).max(200),
    target_type: z.string().max(64).optional(),
    target_id: z.string().max(200).optional(),
    metadata: z.record(z.unknown()).optional(),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sb = supabaseAsUser(req.accessToken!);
  const { error } = await sb.from("audit_logs").insert({
    actor_id: req.user!.id,
    actor_email: req.user!.email,
    ...parsed.data,
  });
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ ok: true });
});

export default router;
