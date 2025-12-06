-- Add is_flash_sale column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_flash_sale boolean DEFAULT false;

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_is_flash_sale ON public.products(is_flash_sale);
