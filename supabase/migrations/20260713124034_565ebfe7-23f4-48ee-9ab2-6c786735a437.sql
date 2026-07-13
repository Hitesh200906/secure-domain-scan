
-- AUDIT LOGS
DROP POLICY IF EXISTS "audit open all" ON public.audit_logs;
CREATE POLICY "audit admin read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "audit authenticated insert" ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "notif open all" ON public.notifications;
CREATE POLICY "notif owner read" ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "notif owner update" ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif owner delete" ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ORDERS: add owner mutation policies
CREATE POLICY "orders owner update" ON public.orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = orders.store_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = orders.store_id AND s.owner_id = auth.uid()));
CREATE POLICY "orders owner delete" ON public.orders FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = orders.store_id AND s.owner_id = auth.uid()));

-- REPORTS
DROP POLICY IF EXISTS "reports open all" ON public.reports;
CREATE POLICY "reports owner read" ON public.reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "reports admin write" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "reports admin update" ON public.reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "reports admin delete" ON public.reports FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));

-- SUPPORT TICKETS: prevent user_id / email spoofing
DROP POLICY IF EXISTS "tickets insert anyone" ON public.support_tickets;
CREATE POLICY "tickets insert authenticated" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (email IS NULL OR email = (auth.jwt() ->> 'email')));
CREATE POLICY "tickets insert anon" ON public.support_tickets FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- TICKET MESSAGES
DROP POLICY IF EXISTS "tmsg open all" ON public.ticket_messages;
CREATE POLICY "tmsg participant read" ON public.ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_messages.ticket_id
      AND (t.user_id = auth.uid() OR t.email = (auth.jwt() ->> 'email')
           OR public.has_role(auth.uid(),'admin')
           OR public.has_role(auth.uid(),'super_admin')
           OR public.has_role(auth.uid(),'master_admin'))
  ));
CREATE POLICY "tmsg participant insert" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_messages.ticket_id
      AND (t.user_id = auth.uid() OR t.email = (auth.jwt() ->> 'email')
           OR public.has_role(auth.uid(),'admin')
           OR public.has_role(auth.uid(),'super_admin')
           OR public.has_role(auth.uid(),'master_admin'))
  ));
CREATE POLICY "tmsg admin update" ON public.ticket_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
CREATE POLICY "tmsg admin delete" ON public.ticket_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));
