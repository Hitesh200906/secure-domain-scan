ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE public.scan_requests ADD COLUMN IF NOT EXISTS dispatched_at timestamptz;
ALTER TABLE public.scan_requests ADD COLUMN IF NOT EXISTS dispatch_error text;

DROP POLICY IF EXISTS "reports owner read" ON public.reports;
CREATE POLICY "reports owner read" ON public.reports FOR SELECT TO authenticated
  USING (
    (auth.uid() = user_id AND delivered_at IS NOT NULL)
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'master_admin')
  );