-- Add delivery location options to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS home_delivery boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS office_delivery boolean DEFAULT true;

-- Add comment to explain the columns
COMMENT ON COLUMN public.products.home_delivery IS 'Whether product can be delivered to home addresses';
COMMENT ON COLUMN public.products.office_delivery IS 'Whether product can be delivered to office addresses';
