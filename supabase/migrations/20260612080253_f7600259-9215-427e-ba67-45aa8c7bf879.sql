
-- Fix: remove anon write/read on profiles and scan_requests; restrict admin tables
DROP POLICY IF EXISTS "profiles admin read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles admin update all" ON public.profiles;
DROP POLICY IF EXISTS "scans admin read all" ON public.scan_requests;
DROP POLICY IF EXISTS "scans admin update all" ON public.scan_requests;
DROP POLICY IF EXISTS "scans admin delete all" ON public.scan_requests;
DROP POLICY IF EXISTS "admins open all" ON public.admins;
DROP POLICY IF EXISTS "tickets open all" ON public.support_tickets;

-- Admin-scoped policies via has_role()
CREATE POLICY "profiles admin read all" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "profiles admin update all" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));

CREATE POLICY "scans admin read all" ON public.scan_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "scans admin update all" ON public.scan_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "scans admin delete all" ON public.scan_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));

-- Admins table: only master/super admins can read/manage
CREATE POLICY "admins read" ON public.admins FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "admins manage" ON public.admins FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'master_admin'))
  WITH CHECK (public.has_role(auth.uid(),'master_admin'));

-- Support tickets: submitter can read/insert; admins can manage. Allow anonymous INSERT for contact form.
CREATE POLICY "tickets insert anyone" ON public.support_tickets FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "tickets read own" ON public.support_tickets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR email = (auth.jwt() ->> 'email')
    OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "tickets admin manage" ON public.support_tickets FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "tickets admin delete" ON public.support_tickets FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'master_admin') OR public.has_role(auth.uid(),'super_admin'));

-- Orders: validate buyer_email matches JWT email on insert
DROP POLICY IF EXISTS "orders authenticated insert" ON public.orders;
CREATE POLICY "orders authenticated insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id AND (buyer_email IS NULL OR buyer_email = (auth.jwt() ->> 'email')));

-- Revoke EXECUTE on trigger-only SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_role_change() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.seed_master_admin() FROM anon, authenticated, public;
