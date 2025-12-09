-- Add subscription_end_date column to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Update RLS policies (optional, but good practice if you want to enforce visibility DB-side)
-- For now, we handle visibility in the application layer (filtering by date).

-- Comment on column
COMMENT ON COLUMN public.stores.subscription_end_date IS 'The expiration date of the store subscription';
