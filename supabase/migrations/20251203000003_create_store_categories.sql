-- Create store_categories table
CREATE TABLE IF NOT EXISTS public.store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

-- Policies for store_categories
CREATE POLICY "Public can view store_categories" ON public.store_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage store_categories" ON public.store_categories FOR ALL USING (auth.role() = 'authenticated');

-- Insert default store categories
INSERT INTO public.store_categories (name, name_ar, slug) VALUES
('Electronics Store', 'محل إلكترونيات', 'electronics-store'),
('Clothing Store', 'محل ملابس', 'clothing-store'),
('Supermarket', 'سوبر ماركت', 'supermarket'),
('Furniture', 'أثاث', 'furniture'),
('Cosmetics', 'مستحضرات تجميل', 'cosmetics'),
('Bookstore', 'مكتبة', 'bookstore');

-- Update stores table to reference store_categories
-- First, drop the old constraint if it exists
ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_category_id_fkey;

-- Add the new constraint
ALTER TABLE public.stores
ADD CONSTRAINT stores_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES public.store_categories(id);

-- Comment
COMMENT ON COLUMN public.stores.category_id IS 'The category of the store, referencing store_categories table';
