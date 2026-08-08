CREATE OR REPLACE FUNCTION public.close_my_ticket(_ticket_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ok boolean := false;
BEGIN
  IF auth.uid() IS NULL OR public.is_banned(auth.uid()) THEN
    RETURN false;
  END IF;

  UPDATE public.support_tickets
     SET status = 'closed'
   WHERE id = _ticket_id
     AND (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
     AND status <> 'closed';

  GET DIAGNOSTICS ok = ROW_COUNT;
  RETURN ok;
END;
$$;

REVOKE ALL ON FUNCTION public.close_my_ticket(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.close_my_ticket(uuid) TO authenticated;