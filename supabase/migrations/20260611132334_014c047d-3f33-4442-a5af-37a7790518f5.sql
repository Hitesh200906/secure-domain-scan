
-- 1. Enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('master_admin','super_admin','admin','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users view own roles" ON public.user_roles;
CREATE POLICY "users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. Security-definer helpers
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'master_admin' THEN 1
    WHEN 'super_admin'  THEN 2
    WHEN 'admin'        THEN 3
    WHEN 'user'         THEN 4
  END LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'master_admin')
$$;

-- 4. Audit trigger for role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_action text;
  v_role public.app_role;
  v_user uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'role.grant'; v_role := NEW.role; v_user := NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'role.revoke'; v_role := OLD.role; v_user := OLD.user_id;
  ELSE RETURN NULL;
  END IF;
  INSERT INTO public.audit_logs(action, target_type, target_id, metadata)
  VALUES (v_action, 'user_role', v_user::text, jsonb_build_object('role', v_role));
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS user_roles_audit ON public.user_roles;
CREATE TRIGGER user_roles_audit
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- 5. Auto-grant master_admin to the master email on signup
CREATE OR REPLACE FUNCTION public.seed_master_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'hitesh.tanwar8318@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'master_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS seed_master_admin_trigger ON auth.users;
CREATE TRIGGER seed_master_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_master_admin();

-- 6. Backfill: if the master user already exists, grant the role now
INSERT INTO public.user_roles(user_id, role)
SELECT id, 'master_admin'::public.app_role FROM auth.users
WHERE lower(email) = 'hitesh.tanwar8318@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Backfill: grant 'admin' role to anyone in legacy public.admins(active=true)
INSERT INTO public.user_roles(user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM public.admins a
JOIN auth.users u ON lower(u.email) = lower(a.email)
WHERE a.active = true
ON CONFLICT (user_id, role) DO NOTHING;
