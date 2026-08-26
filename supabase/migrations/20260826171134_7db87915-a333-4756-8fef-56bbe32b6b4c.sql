DROP POLICY IF EXISTS "pricing admin update" ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing admin insert" ON public.pricing_plans;
DROP POLICY IF EXISTS "pricing admin delete" ON public.pricing_plans;

CREATE POLICY "pricing admin update" ON public.pricing_plans
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));

CREATE POLICY "pricing admin insert" ON public.pricing_plans
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));

CREATE POLICY "pricing admin delete" ON public.pricing_plans
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'master_admin'));