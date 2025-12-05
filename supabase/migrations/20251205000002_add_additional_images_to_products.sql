-- Add additional_images column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS additional_images text[] DEFAULT '{}';
