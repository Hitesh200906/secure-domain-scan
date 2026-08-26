CREATE OR REPLACE FUNCTION public.seed_master_admin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF lower(NEW.email) = 'hitesh.tanwar8318@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'master_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $function$;

DELETE FROM public.user_roles r
USING auth.users u
WHERE r.user_id = u.id
  AND lower(u.email) = 'hitesh.tanwar8381@gmail.com';

INSERT INTO public.user_roles(user_id, role)
SELECT u.id, 'master_admin'::app_role FROM auth.users u
WHERE lower(u.email) = 'hitesh.tanwar8318@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;