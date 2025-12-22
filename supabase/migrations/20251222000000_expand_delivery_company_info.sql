-- Add expanded info columns to delivery_companies
ALTER TABLE public.delivery_companies 
ADD COLUMN IF NOT EXISTS phone1 TEXT,
ADD COLUMN IF NOT EXISTS phone2 TEXT,
ADD COLUMN IF NOT EXISTS phone3 TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;
