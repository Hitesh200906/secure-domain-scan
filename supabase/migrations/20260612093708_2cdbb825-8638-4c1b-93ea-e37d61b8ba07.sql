
-- Add skills column for multi-select skills/categories on stores
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}';

-- Storage RLS for store-assets bucket
-- Public read so logos/banners can be displayed on public store pages
CREATE POLICY "store-assets public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-assets');

-- Authenticated users can upload only to a folder matching their user id
CREATE POLICY "store-assets owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'store-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "store-assets owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'store-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "store-assets owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'store-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
