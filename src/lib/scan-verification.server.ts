export function sixDigits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sha256(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function loadScan(scanId: string, userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("scan_requests")
    .select("*")
    .eq("id", scanId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Scan not found");
  return { supabaseAdmin, scan: data as unknown as Record<string, unknown> };
}

export async function updateScan(scanId: string, patch: Record<string, unknown>) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("scan_requests")
    .update(patch as never)
    .eq("id", scanId);
  if (error) throw new Error(error.message);
}

export async function fetchSiteHtml(rawUrl: string) {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  const res = await fetch(url, {
    headers: { "user-agent": "NexefySecurityBot/1.0 (+verification)" },
    redirect: "follow",
  });
  return (await res.text()).slice(0, 300000);
}

export async function aiCodePresent(html: string, code: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return false;
  try {
    const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          {
            role: "system",
            content:
              'You check whether a verification code appears anywhere in a website\'s HTML (meta tag, header, footer, comment, attribute). Reply with only "YES" or "NO".',
          },
          { role: "user", content: `Code: ${code}\n\nHTML:\n${html.slice(0, 60000)}` },
        ],
      }),
    });
    const json = (await ai.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return (json.choices?.[0]?.message?.content ?? "").trim().toUpperCase().startsWith("YES");
  } catch {
    return false;
  }
}
