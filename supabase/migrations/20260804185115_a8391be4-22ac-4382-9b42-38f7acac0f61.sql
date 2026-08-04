ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz;

CREATE OR REPLACE FUNCTION public.is_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND status IN ('banned','suspended')
  )
$$;

REVOKE ALL ON FUNCTION public.is_banned(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_banned(uuid) TO authenticated, service_role;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['stores','products','store_apps','orders','scan_requests','support_tickets','ticket_messages','reports','notifications']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'banned users cannot write', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (NOT public.is_banned(auth.uid())) WITH CHECK (NOT public.is_banned(auth.uid()))',
      'banned users cannot write', t
    );
  END LOOP;
END $$;
