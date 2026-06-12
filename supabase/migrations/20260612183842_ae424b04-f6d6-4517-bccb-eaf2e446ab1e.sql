
CREATE TABLE IF NOT EXISTS public.store_apps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  app_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, app_key)
);

GRANT SELECT ON public.store_apps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_apps TO authenticated;
GRANT ALL ON public.store_apps TO service_role;

ALTER TABLE public.store_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_apps public read" ON public.store_apps FOR SELECT USING (true);
CREATE POLICY "store_apps owner insert" ON public.store_apps FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.owner_id = auth.uid()));
CREATE POLICY "store_apps owner update" ON public.store_apps FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.owner_id = auth.uid()));
CREATE POLICY "store_apps owner delete" ON public.store_apps FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.owner_id = auth.uid()));

CREATE TRIGGER trg_store_apps_updated BEFORE UPDATE ON public.store_apps
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.install_default_store_apps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.store_apps (store_id, app_key, position) VALUES
    (NEW.id, 'chat', 0),
    (NEW.id, 'announcements', 1),
    (NEW.id, 'forum', 2),
    (NEW.id, 'faq', 3),
    (NEW.id, 'reviews', 4)
  ON CONFLICT (store_id, app_key) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_install_default_apps ON public.stores;
CREATE TRIGGER trg_install_default_apps
AFTER INSERT ON public.stores
FOR EACH ROW EXECUTE FUNCTION public.install_default_store_apps();

-- Backfill defaults for existing stores
INSERT INTO public.store_apps (store_id, app_key, position)
SELECT s.id, x.app_key, x.position
FROM public.stores s
CROSS JOIN (VALUES ('chat',0),('announcements',1),('forum',2),('faq',3),('reviews',4)) AS x(app_key, position)
ON CONFLICT (store_id, app_key) DO NOTHING;
