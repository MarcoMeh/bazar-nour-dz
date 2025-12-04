-- Add category_id to stores table
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_stores_category_id ON public.stores(category_id);

-- Comment
COMMENT ON COLUMN public.stores.category_id IS 'The main category of the store (e.g. Clothing, Electronics)';
