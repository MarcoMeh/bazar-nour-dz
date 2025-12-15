-- Drop table if exists to ensure clean state (especially since foreign key target changed)
DROP TABLE IF EXISTS public.store_category_relations CASCADE;

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.store_category_relations (
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- Changed to reference public.categories (product categories)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (store_id, category_id)
);

-- Enable RLS
ALTER TABLE public.store_category_relations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view store_category_relations" ON public.store_category_relations FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage store_category_relations" ON public.store_category_relations FOR ALL USING (auth.role() = 'authenticated');

-- Note: We are NOT migrating old category_id data because it referenced 'store_categories' table, 
-- and we are now switching to 'public.categories'. IDs are not compatible.
-- Admin will need to re-assign categories for stores.
