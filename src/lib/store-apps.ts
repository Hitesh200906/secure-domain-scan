import {
  MessagesSquare, Megaphone, MessageCircle, HelpCircle, Star,
  LifeBuoy, BookOpen, Download, History, Lightbulb, BarChart3,
  Calendar, Sparkles, Users, Info,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type AppKey =
  | "chat" | "announcements" | "forum" | "faq" | "reviews"
  | "support" | "resources" | "downloads" | "changelog"
  | "feature_requests" | "polls" | "events" | "showcase" | "members" | "about";

export type AppDef = {
  key: AppKey;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string; // tailwind bg gradient stops
  default?: boolean;
};

export const APP_CATALOG: AppDef[] = [
  { key: "chat", name: "Chat", description: "Community chat, member discussions, file sharing.", icon: MessagesSquare, color: "from-orange-500 to-rose-500", default: true },
  { key: "announcements", name: "Announcements", description: "Updates, product launches and important notices.", icon: Megaphone, color: "from-amber-400 to-orange-500", default: true },
  { key: "forum", name: "Forum", description: "Categories, topics, replies and upvotes.", icon: MessageCircle, color: "from-blue-500 to-indigo-500", default: true },
  { key: "faq", name: "FAQ", description: "Searchable frequently asked questions.", icon: HelpCircle, color: "from-emerald-500 to-teal-500", default: true },
  { key: "reviews", name: "Reviews", description: "Ratings and written reviews from members.", icon: Star, color: "from-yellow-400 to-amber-500", default: true },
  { key: "support", name: "Support", description: "Contact support and submit help requests.", icon: LifeBuoy, color: "from-sky-500 to-cyan-500" },
  { key: "resources", name: "Resources", description: "Useful links, docs and external resources.", icon: BookOpen, color: "from-violet-500 to-fuchsia-500" },
  { key: "downloads", name: "Downloads", description: "Product files, templates and assets.", icon: Download, color: "from-green-500 to-emerald-500" },
  { key: "changelog", name: "Changelog", description: "Product updates and version history.", icon: History, color: "from-slate-400 to-slate-600" },
  { key: "feature_requests", name: "Feature Requests", description: "Suggest features and vote on them.", icon: Lightbulb, color: "from-yellow-500 to-orange-500" },
  { key: "polls", name: "Polls", description: "Community voting and surveys.", icon: BarChart3, color: "from-pink-500 to-rose-500" },
  { key: "events", name: "Events", description: "Community events, workshops and webinars.", icon: Calendar, color: "from-red-500 to-pink-500" },
  { key: "showcase", name: "Showcase", description: "Customer projects, stories, portfolio submissions.", icon: Sparkles, color: "from-purple-500 to-indigo-500" },
  { key: "members", name: "Members", description: "Community member list, roles and permissions.", icon: Users, color: "from-cyan-500 to-blue-500" },
  { key: "about", name: "About", description: "Store information, rules and contact details.", icon: Info, color: "from-zinc-500 to-zinc-700" },
];

export const APP_MAP: Record<string, AppDef> = Object.fromEntries(APP_CATALOG.map((a) => [a.key, a]));

export type StoreApp = {
  id: string;
  store_id: string;
  app_key: AppKey;
  enabled: boolean;
  position: number;
  settings: Record<string, unknown>;
};

export async function getInstalledApps(storeId: string): Promise<StoreApp[]> {
  const { data } = await supabase
    .from("store_apps" as any)
    .select("*")
    .eq("store_id", storeId)
    .order("position", { ascending: true });
  return ((data as unknown) as StoreApp[]) ?? [];
}

export async function installApp(storeId: string, key: AppKey, position: number) {
  return supabase.from("store_apps" as any).insert({ store_id: storeId, app_key: key, position });
}

export async function uninstallApp(id: string) {
  return supabase.from("store_apps" as any).delete().eq("id", id);
}

export async function setAppEnabled(id: string, enabled: boolean) {
  return supabase.from("store_apps" as any).update({ enabled }).eq("id", id);
}
