import { useStore } from "@/lib/store-context";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStoreOrders, type Order, type Store } from "@/lib/business";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/business/orders")({ component: OrdersPage });

function OrdersPage() {
  const { store } = useStore() as Store;
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getStoreOrders(store.id).then(d => { setItems(d); setLoading(false); }); }, [store.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">All transactions across your store.</p>
      </div>
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">No orders yet.</div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left p-3">Buyer</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map(o => (
                <tr key={o.id}>
                  <td className="p-3">{o.buyer_email ?? "Guest"}</td>
                  <td className="p-3">${Number(o.amount).toFixed(2)}</td>
                  <td className="p-3"><span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{o.status}</span></td>
                  <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
