-- Link profiles to stores for store owners
-- This allows each store owner profile to be associated with a specific store

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_store_id ON public.profiles(store_id);

-- Comment
COMMENT ON COLUMN public.profiles.store_id IS 'Link to store for store_owner role users';
