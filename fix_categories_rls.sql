-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;

DROP POLICY IF EXISTS "Public can view subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Authenticated users can manage subcategories" ON public.subcategories;

-- Create policies for Categories
CREATE POLICY "Public can view categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage categories"
ON public.categories FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create policies for Subcategories
CREATE POLICY "Public can view subcategories"
ON public.subcategories FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage subcategories"
ON public.subcategories FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Ensure storage bucket policies for category-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop storage policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public Access Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload category images" ON storage.objects;

CREATE POLICY "Public Access Category Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'category-images' );

CREATE POLICY "Authenticated users can upload category images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'category-images' AND auth.role() = 'authenticated' );
