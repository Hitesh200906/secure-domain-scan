import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadStoreAsset(
  userId: string,
  file: File,
  kind: "logo" | "banner",
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("store-assets")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage
    .from("store-assets")
    .createSignedUrl(path, TEN_YEARS);
  if (error || !data) throw error ?? new Error("Could not sign URL");
  return data.signedUrl;
}
