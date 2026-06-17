
-- Pricing plans: remove open write/update/delete, restrict to admins
DROP POLICY IF EXISTS "pricing open write" ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing open update" ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing open delete" ON public.pricing_plans;

CREATE POLICY "pricing admin insert" ON public.pricing_plans
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "pricing admin update" ON public.pricing_plans
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "pricing admin delete" ON public.pricing_plans
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- user_roles: only master_admin may insert/update/delete
CREATE POLICY "roles master insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'::public.app_role));

CREATE POLICY "roles master update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'master_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'master_admin'::public.app_role));

CREATE POLICY "roles master delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'master_admin'::public.app_role));
