import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAsUser } from "../lib/supabase.js";

const router = Router();

const TicketSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(3).max(5000),
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

router.post("/tickets", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = TicketSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = supabaseAsUser(req.accessToken!);
  const { data: ticket, error } = await sb
    .from("support_tickets")
    .insert({
      user_id: req.user!.id,
      subject: parsed.data.subject,
      message: parsed.data.message,
      name: parsed.data.name ?? null,
      email: parsed.data.email ?? req.user!.email,
      priority: parsed.data.priority ?? "normal",
      status: "open",
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });

  await sb.from("ticket_messages").insert({
    ticket_id: ticket.id,
    author_type: "user",
    author_name: parsed.data.name ?? req.user!.email ?? "user",
    body: parsed.data.message,
  });

  return res.status(201).json({ ticket });
});

router.get("/tickets", requireAuth, async (req: AuthedRequest, res) => {
  const sb = supabaseAsUser(req.accessToken!);
  const { data, error } = await sb
    .from("support_tickets")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ tickets: data });
});

export default router;
