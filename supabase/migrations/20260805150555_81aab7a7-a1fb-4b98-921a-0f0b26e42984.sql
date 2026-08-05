-- 1. Remove fully public row read on products
DROP POLICY IF EXISTS "products public read" ON public.products;

-- 2. Owner or completed-order buyer can read the full row
CREATE POLICY "products owner or buyer read"
ON public.products
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.product_id = products.id
      AND o.buyer_id = auth.uid()
      AND o.status IN ('paid','completed','fulfilled')
  )
);

-- 3. Public marketing-only view (no access/delivery/service_settings)
CREATE OR REPLACE VIEW public.products_public AS
SELECT
  id, store_id, name, headline, short_description, description,
  image_url, banner_url, logo_url, thumbnail_url, gallery,
  product_type, price, billing_type, benefits, faq, tags,
  category, subcategory, features, requirements, apps,
  demo_video_url, preview_url, docs_url, seo, version,
  active, status, created_at, updated_at
FROM public.products
WHERE active = true AND status = 'published';

ALTER VIEW public.products_public SET (security_invoker = off);

GRANT SELECT ON public.products_public TO anon, authenticated;
GRANT SELECT ON public.products_public TO service_role;

-- 4. Belt and braces: never expose sensitive columns to the Data API roles
REVOKE SELECT (access, delivery, service_settings) ON public.products FROM anon;