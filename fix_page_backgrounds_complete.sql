-- Create the page_backgrounds table if it skips
CREATE TABLE IF NOT EXISTS public.page_backgrounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_key TEXT NOT NULL UNIQUE,
    page_name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.page_backgrounds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON public.page_backgrounds;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.page_backgrounds;

-- Re-create policies
CREATE POLICY "Allow public read access" ON public.page_backgrounds FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update" ON public.page_backgrounds FOR ALL USING (auth.role() = 'authenticated');

-- Insert default values (UPSERT)
INSERT INTO public.page_backgrounds (page_key, page_name, image_url)
VALUES 
    ('home_hero', 'Home Page Hero', NULL),
    ('stores_hero', 'Stores Page Header', NULL),
    ('auth_bg', 'Login/Register Background', NULL),
    ('register_hero', 'Seller Registration Background', NULL),
    ('products_bg', 'Products Page Background', NULL)
ON CONFLICT (page_key) DO UPDATE SET 
    page_name = EXCLUDED.page_name;

-- STORAGE SETUP
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-images', 'store-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;

-- Re-create storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'store-images' );
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'store-images' AND auth.role() = 'authenticated' );
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'store-images' AND auth.role() = 'authenticated' );
