ALTER TABLE public.scan_requests
  ADD COLUMN IF NOT EXISTS scan_config jsonb,
  ADD COLUMN IF NOT EXISTS config_submitted_at timestamptz;