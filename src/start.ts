import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

/**
 * Prevent stale-HTML / mismatched-chunk 404s after redeploys: HTML pages are
 * always revalidated so they never reference hashed JS chunks from a previous
 * deployment. Fingerprinted /assets/* files keep their long-lived immutable
 * caching (handled by the static asset layer).
 */
const htmlCacheMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  if (result.pathname.startsWith("/assets/")) return result;
  const contentType = result.response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    result.response.headers.set("cache-control", "public, max-age=0, must-revalidate");
  }
  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, htmlCacheMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
