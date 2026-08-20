ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS api_key text;

CREATE OR REPLACE FUNCTION public.verify_admin_api_key(_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.active
      AND a.api_key IS NOT NULL
      AND a.api_key = _key
      AND lower(a.email) = lower((SELECT u.email FROM auth.users u WHERE u.id = auth.uid()))
  );
$$;

GRANT EXECUTE ON FUNCTION public.verify_admin_api_key(text) TO authenticated;

UPDATE public.pricing_plans
SET cta_label = 'Enterprise scan',
    price_label = '/month',
    price_monthly = CASE WHEN price_monthly <= 0 THEN 899 ELSE price_monthly END
WHERE slug = 'enterprise';