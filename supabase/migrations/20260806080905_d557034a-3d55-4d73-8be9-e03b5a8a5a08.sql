REVOKE SELECT (owner_id) ON public.stores FROM authenticated;

CREATE OR REPLACE FUNCTION public.owns_store(_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.stores s WHERE s.id = _store_id AND s.owner_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.my_store_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id FROM public.stores s WHERE s.owner_id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.owns_store(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.my_store_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_store(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_store_ids() TO authenticated;