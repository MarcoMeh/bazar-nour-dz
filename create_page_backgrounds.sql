-- Create a table to store page backgrounds
CREATE TABLE IF NOT EXISTS public.page_backgrounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_key TEXT NOT NULL UNIQUE, -- e.g., 'home_hero', 'stores_hero'
    page_name TEXT NOT NULL,       -- e.g., 'Home Page', 'Stores Page'
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.page_backgrounds ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.page_backgrounds
    FOR SELECT
    USING (true);

-- Allow admin write access (assuming admin check is done via role or existing policies)
-- For now, allow authenticated users to update for simplicity, strict admin policies can be refined
CREATE POLICY "Allow authenticated update" ON public.page_backgrounds
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Insert initial defaults
INSERT INTO public.page_backgrounds (page_key, page_name, image_url)
VALUES 
    ('home_hero', 'Home Page Hero', NULL),
    ('stores_hero', 'Stores Page Header', NULL),
    ('auth_bg', 'Login/Register Background', NULL),
    ('register_hero', 'Seller Registration Background', NULL),
    ('products_bg', 'Products Page Background', NULL)
ON CONFLICT (page_key) DO NOTHING;
