-- 1. Track whether a user has set an account password
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_set boolean NOT NULL DEFAULT false;

-- 2. Admins can send notifications to users
DROP POLICY IF EXISTS "notif admin insert" ON public.notifications;
CREATE POLICY "notif admin insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'master_admin'::app_role)
  );

-- 3. Closed tickets are read-only for users, but staff can still reply
CREATE OR REPLACE FUNCTION public.block_user_msg_on_closed_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  st text;
BEGIN
  SELECT status INTO st FROM public.support_tickets WHERE id = NEW.ticket_id;
  IF st = 'closed'
     AND NOT (
       has_role(auth.uid(), 'admin'::app_role)
       OR has_role(auth.uid(), 'super_admin'::app_role)
       OR has_role(auth.uid(), 'master_admin'::app_role)
     ) THEN
    RAISE EXCEPTION 'This ticket is closed and cannot receive new messages';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_user_msg_on_closed_ticket ON public.ticket_messages;
CREATE TRIGGER trg_block_user_msg_on_closed_ticket
BEFORE INSERT ON public.ticket_messages
FOR EACH ROW EXECUTE FUNCTION public.block_user_msg_on_closed_ticket();

-- 4. Admins can close tickets (update policy already exists); ensure realtime payloads are complete
ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;