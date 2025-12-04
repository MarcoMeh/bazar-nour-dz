-- Add image_url column to store_categories table
ALTER TABLE public.store_categories
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comment
COMMENT ON COLUMN public.store_categories.image_url IS 'URL of the store category image';
