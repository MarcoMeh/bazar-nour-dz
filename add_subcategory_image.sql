-- Add image_url column to subcategories table
ALTER TABLE public.subcategories 
ADD COLUMN IF NOT EXISTS image_url text;
