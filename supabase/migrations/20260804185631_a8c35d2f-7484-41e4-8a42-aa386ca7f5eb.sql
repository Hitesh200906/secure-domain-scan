-- 1. audit_logs: remove forgeable client inserts
DROP POLICY IF EXISTS "audit authenticated insert" ON public.audit_logs;

-- 2. storage: restrict store-assets reads to owners (signed URLs still work)
DROP POLICY IF EXISTS "store-assets public read" ON storage.objects;
CREATE POLICY "store-assets owner read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'store-assets' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- 3. stores: stop exposing owner_id to anonymous visitors
DROP POLICY IF EXISTS "stores public read" ON public.stores;
CREATE POLICY "stores authenticated read" ON public.stores
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE VIEW public.public_stores AS
  SELECT id, name, slug, description, logo_url, banner_url, category,
         theme_color, accent_color, website_url, social_links, verified,
         member_count, skills, created_at, updated_at
  FROM public.stores;

GRANT SELECT ON public.public_stores TO anon, authenticated;