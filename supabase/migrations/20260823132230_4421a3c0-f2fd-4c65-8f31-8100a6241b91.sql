ALTER TABLE public.scan_requests ADD COLUMN IF NOT EXISTS callback_token text;
REVOKE SELECT (callback_token) ON public.scan_requests FROM anon, authenticated;