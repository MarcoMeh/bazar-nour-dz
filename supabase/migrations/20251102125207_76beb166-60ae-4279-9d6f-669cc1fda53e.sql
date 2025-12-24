-- Add delivery type availability and pricing to wilayas
ALTER TABLE public.wilayas 
ADD COLUMN IF NOT EXISTS home_delivery_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS desk_delivery_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS home_delivery_price numeric DEFAULT 400,
ADD COLUMN IF NOT EXISTS desk_delivery_price numeric DEFAULT 300;

-- Update existing wilayas to use delivery_price as home_delivery_price
UPDATE public.wilayas 
SET home_delivery_price = delivery_price,
    desk_delivery_price = delivery_price * 0.75;

-- Add parent_id to categories for hierarchical structure
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);