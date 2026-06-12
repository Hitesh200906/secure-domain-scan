import { supabase } from "@/integrations/supabase/client";

export type Store = {
  id: string;
  owner_id: string;
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

export async function getMyStore(userId: string): Promise<Store | null> {
  const { data } = await supabase.from("stores").select("*").eq("owner_id", userId).maybeSingle();
  return data as Store | null;
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const { data } = await supabase.from("stores").select("*").eq("slug", slug).maybeSingle();
  return data as Store | null;
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
