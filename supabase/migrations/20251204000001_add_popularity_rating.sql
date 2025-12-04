-- Add popularity and rating columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;

-- Add index for better query performance on sorting
CREATE INDEX IF NOT EXISTS idx_products_view_count ON public.products(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_average_rating ON public.products(average_rating DESC);

-- Add check constraint to ensure rating is between 0 and 5
ALTER TABLE public.products 
ADD CONSTRAINT check_average_rating CHECK (average_rating >= 0 AND average_rating <= 5);
