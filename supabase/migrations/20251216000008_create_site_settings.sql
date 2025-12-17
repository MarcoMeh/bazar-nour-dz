-- Drop table if exists to ensure schema update
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'Bazarna',
  logo_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  whatsapp_number TEXT,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Allow admin to manage settings (assuming admin role check logic)
-- Note: 'admin' role check depends on how your auth is set up. 
-- Often it's checking public.profiles.role or similar.
-- For simplicity/safety in this context, we'll allow authenticated users with a specific check if possible, 
-- or rely on the frontend/backend logic to gate the update page. 
-- A common pattern here if using Supabase Auth custom claims or a profile lookup:
CREATE POLICY "Admins can update site settings"
  ON public.site_settings
  FOR ALL
  USING (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Insert a default row if not exists
INSERT INTO public.site_settings (id, site_name)
SELECT gen_random_uuid(), 'Bazarna'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);
