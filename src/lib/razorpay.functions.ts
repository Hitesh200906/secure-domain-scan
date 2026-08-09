import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  amountInMinorUnits,
  bonusFor,
  createRazorpayOrder,
  fetchRazorpayPayment,
  normalizeCurrency,
  verifySignature,
} from "./razorpay.server";

const OrderInput = z.object({
  credits: z.number().int().min(100).max(100000),
  currency: z.string().min(3).max(4),
});

const VerifyInput = z.object({
  razorpay_order_id: z.string().min(5).max(120),
  razorpay_payment_id: z.string().min(5).max(120),
  razorpay_signature: z.string().min(10).max(300),
});

export const createCreditsOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => OrderInput.parse(data))
  .handler(async ({ data, context }) => {
    const currency = normalizeCurrency(data.currency);
    const bonus = bonusFor(data.credits);
    const amount = amountInMinorUnits(data.credits, currency);

    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt: `credits_${Date.now()}`,
      notes: { user_id: context.userId, credits: String(data.credits) },
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("payments").insert({
      user_id: context.userId,
      provider: "razorpay",
      order_id: order.id,
      amount: amount / 100,
      currency,
      credits: data.credits,
      bonus_credits: bonus,
      status: "created",
    });
    if (error) throw new Error(error.message);

    return {
      order_id: order.id,
      amount,
      currency,
      credits: data.credits,
      bonus,
      key_id: process.env["RAZORPAY_KEY_ID"]!,
    };
  });

export const verifyCreditsPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => VerifyInput.parse(data))
  .handler(async ({ data, context }) => {
    if (!verifySignature(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature)) {
      throw new Error("Payment verification failed");
    }

    const remote = await fetchRazorpayPayment(data.razorpay_payment_id);
    if (remote.order_id !== data.razorpay_order_id || !["captured", "authorized"].includes(remote.status)) {
      throw new Error("Payment was not completed");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: readErr } = await supabaseAdmin
      .from("payments")
      .select("user_id, credits, bonus_credits, status")
      .eq("order_id", data.razorpay_order_id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!row || row.user_id !== context.userId) throw new Error("Payment not found");

    const { data: balance, error } = await supabaseAdmin.rpc("settle_payment", {
      _order_id: data.razorpay_order_id,
      _payment_id: data.razorpay_payment_id,
    });
    if (error) throw new Error(error.message);

    return { balance: Number(balance ?? 0), credited: row.credits + row.bonus_credits };
  });
