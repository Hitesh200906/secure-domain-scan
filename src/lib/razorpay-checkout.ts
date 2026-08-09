export type RazorpayResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (x: unknown) => void) => void };
  }
}

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function openRazorpay(opts: {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string };
}): Promise<RazorpayResult> {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Payment window could not be loaded"));
      return;
    }
    const rzp = new window.Razorpay({
      key: opts.key,
      amount: opts.amount,
      currency: opts.currency,
      order_id: opts.orderId,
      name: opts.name ?? "Nexefy",
      description: opts.description ?? "Power Credits",
      theme: { color: "#2563EB" },
      prefill: opts.prefill ?? {},
      handler: (res: RazorpayResult) => resolve(res),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    } as Record<string, unknown>);
    rzp.on("payment.failed", (e: unknown) => {
      const err = e as { error?: { description?: string } };
      reject(new Error(err?.error?.description ?? "Payment failed"));
    });
    rzp.open();
  });
}
