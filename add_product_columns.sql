-- Add missing boolean columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_delivery_home_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_delivery_desk_available BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_free_delivery BOOLEAN DEFAULT FALSE;

-- Update existing rows to have defaults (optional, but good for consistency)
UPDATE public.products SET is_delivery_home_available = TRUE WHERE is_delivery_home_available IS NULL;
UPDATE public.products SET is_delivery_desk_available = TRUE WHERE is_delivery_desk_available IS NULL;
UPDATE public.products SET is_sold_out = FALSE WHERE is_sold_out IS NULL;
UPDATE public.products SET is_free_delivery = FALSE WHERE is_free_delivery IS NULL;
