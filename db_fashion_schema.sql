-- Add fashion-specific columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sizes text[], -- Array of sizes e.g. ['S', 'M', 'L', 'XL']
ADD COLUMN IF NOT EXISTS colors text[], -- Array of colors e.g. ['Red', '#FF0000', 'Blue']
ADD COLUMN IF NOT EXISTS brand text,    -- Brand name
ADD COLUMN IF NOT EXISTS material text; -- Material description e.g. 'Cotton 100%'

COMMENT ON COLUMN public.products.sizes IS 'Available sizes for clothing/shoes';
COMMENT ON COLUMN public.products.colors IS 'Available colors';

-- You might also want to update your categories data manually in the Admin Panel
-- to reflect Fashion categories: 'Men', 'Women', 'Kids', 'Shoes', 'Accessories'
