-- Add new columns to stores table for advanced features
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS opening_hours TEXT,
ADD COLUMN IF NOT EXISTS location_url TEXT,
ADD COLUMN IF NOT EXISTS return_policy TEXT;

-- Create storage bucket for cover images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('store-covers', 'store-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for store-covers
CREATE POLICY "Public can view store covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-covers');

CREATE POLICY "Authenticated can upload store covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update store covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'store-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete store covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-covers' AND auth.role() = 'authenticated');

-- Comments
COMMENT ON COLUMN public.stores.cover_image_url IS 'URL of the store cover/banner image';
COMMENT ON COLUMN public.stores.opening_hours IS 'Text description of opening hours';
COMMENT ON COLUMN public.stores.location_url IS 'Google Maps link or location description';
COMMENT ON COLUMN public.stores.return_policy IS 'Store return and refund policy';
