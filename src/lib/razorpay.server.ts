import { createHmac, timingSafeEqual } from "crypto";

/** Price of one credit in USD. */
export const USD_PER_CREDIT = 1;

/** Approximate conversion rates from USD, used to price the Razorpay order. */
export const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  INR: 84,
  GBP: 0.79,
  JPY: 157,
  AUD: 1.51,
  CAD: 1.37,
  SGD: 1.35,
  AED: 3.67,
  CHF: 0.9,
  BRL: 5.4,
};

/** Currencies whose smallest unit equals the major unit (no decimals). */
const ZERO_DECIMAL = new Set(["JPY"]);

export function normalizeCurrency(code: string): string {
  const c = (code || "USD").toUpperCase();
  return RATES[c] ? c : "USD";
}

export function bonusFor(credits: number): number {
  return Math.floor(credits * 0.1);
}

/** Returns the charge amount in the currency's smallest unit (e.g. paise/cents). */
export function amountInMinorUnits(credits: number, currency: string): number {
  const cur = normalizeCurrency(currency);
  const major = credits * USD_PER_CREDIT * RATES[cur];
  return ZERO_DECIMAL.has(cur) ? Math.round(major) : Math.round(major * 100);
}

function authHeader(): string {
  const id = process.env["RAZORPAY_KEY_ID"];
  const secret = process.env["RAZORPAY_KEY_SECRET"];
  if (!id || !secret) throw new Error("Payments are not configured");
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}): Promise<{ id: string }> {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader() },
    body: JSON.stringify(input),
  });
  const body = (await res.json()) as { id?: string; error?: { description?: string } };
  if (!res.ok || !body.id) {
    console.error("[razorpay] order failed", res.status, body);
    throw new Error(body.error?.description ?? "Could not start the payment");
  }
  return { id: body.id };
}

export function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env["RAZORPAY_KEY_SECRET"];
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function fetchRazorpayPayment(paymentId: string): Promise<{
  status: string;
  order_id: string;
  amount: number;
  currency: string;
}> {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) throw new Error("Could not verify the payment");
  return (await res.json()) as { status: string; order_id: string; amount: number; currency: string };
}
