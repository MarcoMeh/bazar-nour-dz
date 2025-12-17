-- Ensure page_backgrounds table exists (it might already from previous steps, but safety first)
CREATE TABLE IF NOT EXISTS public.page_backgrounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_key TEXT UNIQUE NOT NULL,
    page_name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_backgrounds ENABLE ROW LEVEL SECURITY;

-- Policies (Adjust if needed, assuming public read, admin write)
CREATE POLICY "Public read page_backgrounds" ON public.page_backgrounds FOR SELECT USING (true);
CREATE POLICY "Admin write page_backgrounds" ON public.page_backgrounds FOR ALL USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Insert default keys for About page if they don't exist
INSERT INTO public.page_backgrounds (page_key, page_name, image_url)
VALUES
    ('about_hero', 'صفحة من نحن - الغلاف (Hero)', NULL),
    ('about_story', 'صفحة من نحن - قصتنا (Story)', NULL)
ON CONFLICT (page_key) DO NOTHING;
