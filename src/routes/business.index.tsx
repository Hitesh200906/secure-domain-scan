import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, Wallet, Bell, Plus } from "lucide-react";
import type { Store, Order, Product } from "@/lib/business";
import { getStoreOrders, getStoreProducts } from "@/lib/business";

export const Route = createFileRoute("/business/")({
  component: BusinessDashboard,
});


function StatCard({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <Icon className="size-4 text-primary" />
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function BusinessDashboard() {
  const { store } = useStore() as Store;
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!store) return;
    getStoreOrders(store.id).then(setOrders);
    getStoreProducts(store.id).then(setProducts);
  }, [store]);

  const revenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const sales = orders.length;
  const mrr = orders.filter(o => o.status === "paid").reduce((s, o) => s + Number(o.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's how {store.name} is performing today.</p>
        </div>
        <Link to="/business/products" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-primary transition">
          <Plus className="size-4" /> New product
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Revenue" value={`$${revenue.toFixed(2)}`} sub="All time" />
        <StatCard icon={ShoppingBag} label="Sales" value={sales} sub={`${sales} orders`} />
        <StatCard icon={Users} label="Members" value={store.member_count} sub="Active" />
        <StatCard icon={TrendingUp} label="MRR" value={`$${mrr.toFixed(2)}`} sub="Recurring" />
        <StatCard icon={Package} label="Products" value={products.length} sub={`${products.filter(p=>p.active).length} active`} />
        <StatCard icon={Wallet} label="Pending payouts" value="$0.00" sub="Next: —" />
        <StatCard icon={Bell} label="Notifications" value="0" sub="No new alerts" />
        <StatCard icon={TrendingUp} label="Conversion" value="—" sub="Coming soon" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link to="/business/orders" className="text-xs text-muted-foreground hover:text-white">View all →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-sm text-muted-foreground py-10 text-center">No orders yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {orders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="truncate">
                    <div className="font-medium truncate">{o.buyer_email ?? "Guest"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${Number(o.amount).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold mb-4">Quick actions</h2>
          <div className="grid gap-2">
            <Link to="/business/products" className="rounded-lg border border-white/10 p-3 text-sm hover:bg-white/5">Add a product</Link>
            <Link to="/business/store" className="rounded-lg border border-white/10 p-3 text-sm hover:bg-white/5">Edit storefront</Link>
            <Link to="/business/payouts" className="rounded-lg border border-white/10 p-3 text-sm hover:bg-white/5">Set up payouts</Link>
            <a href={`/${store.slug}`} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 p-3 text-sm hover:bg-white/5">View public store ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}
