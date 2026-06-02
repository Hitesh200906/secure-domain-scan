
-- =========== profiles: add status column ===========
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- =========== pricing_plans ===========
CREATE TABLE public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  headline text,
  description text,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_label text,
  credits integer NOT NULL DEFAULT 1,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  popular boolean NOT NULL DEFAULT false,
  cta_label text DEFAULT 'Get started',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_plans TO anon;
GRANT ALL ON public.pricing_plans TO service_role;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing public read" ON public.pricing_plans FOR SELECT USING (true);
CREATE POLICY "pricing open write" ON public.pricing_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "pricing open update" ON public.pricing_plans FOR UPDATE USING (true);
CREATE POLICY "pricing open delete" ON public.pricing_plans FOR DELETE USING (true);

-- =========== admins ===========
CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'admin',
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admins TO anon, authenticated;
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins open all" ON public.admins FOR ALL USING (true) WITH CHECK (true);

-- =========== support_tickets ===========
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assigned_to uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO anon, authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets open all" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);

-- =========== ticket_messages ===========
CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_type text NOT NULL DEFAULT 'user',
  author_name text,
  body text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_messages TO anon, authenticated;
GRANT ALL ON public.ticket_messages TO service_role;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tmsg open all" ON public.ticket_messages FOR ALL USING (true) WITH CHECK (true);

-- =========== reports ===========
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES public.scan_requests(id) ON DELETE SET NULL,
  user_id uuid,
  title text NOT NULL,
  summary text,
  severity text DEFAULT 'medium',
  file_url text,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO anon, authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports open all" ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- =========== audit_logs ===========
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,
  actor_role text DEFAULT 'admin',
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO anon, authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit open all" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- =========== notifications ===========
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon, authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif open all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- =========== open up profiles + scan_requests for admin panel ===========
GRANT SELECT, UPDATE, DELETE ON public.profiles TO anon;
GRANT SELECT, UPDATE, DELETE ON public.scan_requests TO anon;
CREATE POLICY "profiles admin read all" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "profiles admin update all" ON public.profiles FOR UPDATE TO anon USING (true);
CREATE POLICY "scans admin read all" ON public.scan_requests FOR SELECT TO anon USING (true);
CREATE POLICY "scans admin update all" ON public.scan_requests FOR UPDATE TO anon USING (true);
CREATE POLICY "scans admin delete all" ON public.scan_requests FOR DELETE TO anon USING (true);

-- updated_at trigger reuse
CREATE TRIGGER pricing_plans_touch BEFORE UPDATE ON public.pricing_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER tickets_touch BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
