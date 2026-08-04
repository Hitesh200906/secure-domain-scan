DROP VIEW IF EXISTS public.public_stores;

DROP POLICY IF EXISTS "stores authenticated read" ON public.stores;
CREATE POLICY "stores public read" ON public.stores
  FOR SELECT TO anon, authenticated USING (true);

REVOKE SELECT ON public.stores FROM anon;
GRANT SELECT (id, name, slug, description, logo_url, banner_url, category,
  theme_color, accent_color, website_url, social_links, verified,
  member_count, total_sales, skills, created_at, updated_at)
  ON public.stores TO anon;