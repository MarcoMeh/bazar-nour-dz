-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    hero_visible BOOLEAN DEFAULT true,
    features_visible BOOLEAN DEFAULT true,
    products_visible BOOLEAN DEFAULT true,
    stores_visible BOOLEAN DEFAULT true,
    categories_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO public.site_settings (id, hero_visible, features_visible, products_visible, stores_visible, categories_visible)
VALUES (1, true, true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access" ON public.site_settings
    FOR SELECT
    USING (true);

-- Policy: Allow admins to update
CREATE POLICY "Allow admins to update" ON public.site_settings
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'admin'
        )
    );

-- Grant access
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
