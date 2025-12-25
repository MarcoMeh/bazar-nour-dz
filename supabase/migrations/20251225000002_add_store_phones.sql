-- Add phone_numbers array column to stores table
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS phone_numbers TEXT[] DEFAULT '{}';

-- Comment
COMMENT ON COLUMN public.stores.phone_numbers IS 'List of additional phone numbers for the store';
