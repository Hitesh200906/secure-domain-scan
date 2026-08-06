import { supabase } from "@/integrations/supabase/client";

export type Store = {
  id: string;
  /** Never selected from the client — owner identity is resolved server-side via owns_store(). */
  owner_id?: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  category: string | null;
  theme_color: string | null;
  accent_color: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null;
  skills: string[] | null;
  verified: boolean;
  member_count: number;
  total_sales: number;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  product_type: string;
  price: number;
  billing_type: string;
  benefits: string[] | null;
  tags: string[] | null;
  category: string | null;
  active: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  store_id: string;
  product_id: string;
  buyer_id: string | null;
  buyer_email: string | null;
  amount: number;
  status: string;
  created_at: string;
};

/** Columns any client may read — owner_id is never exposed. */
export const PUBLIC_STORE_COLUMNS =
  "id,name,slug,description,logo_url,banner_url,category,theme_color,accent_color,website_url,social_links,verified,member_count,total_sales,skills,created_at,updated_at";

/** IDs of the stores owned by the current user (resolved server-side, owner_id stays hidden). */
export async function getMyStoreIds(): Promise<string[]> {
  const { data } = await (supabase as any).rpc("my_store_ids");
  return ((data as string[] | null) ?? []).filter(Boolean);
}

/** Whether the current user owns a given store (verified server-side). */
export async function isStoreOwner(storeId: string): Promise<boolean> {
  const { data } = await (supabase as any).rpc("owns_store", { _store_id: storeId });
  return data === true;
}

export async function getMyStores(): Promise<Store[]> {
  const ids = await getMyStoreIds();
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("stores")
    .select(PUBLIC_STORE_COLUMNS)
    .in("id", ids)
    .order("created_at", { ascending: true });
  return ((data as unknown as Store[]) ?? []);
}

export async function getMyStore(_userId?: string): Promise<Store | null> {
  const stores = await getMyStores();
  return stores[0] ?? null;
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const { data } = await supabase.from("stores").select(PUBLIC_STORE_COLUMNS).eq("slug", slug).maybeSingle();
  return (data as unknown as Store) ?? null;
}

export async function getStoreProducts(storeId: string): Promise<Product[]> {
  const { data } = await supabase.from("products").select("*").eq("store_id", storeId).order("created_at", { ascending: false });
  return (data as Product[]) ?? [];
}

export async function getStoreOrders(storeId: string): Promise<Order[]> {
  const { data } = await supabase.from("orders").select("*").eq("store_id", storeId).order("created_at", { ascending: false });
  return (data as Order[]) ?? [];
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
