-- Add theme_id to stores table
ALTER TABLE public.stores
ADD COLUMN IF NOT EXISTS theme_id TEXT DEFAULT 'default';

-- Comment
COMMENT ON COLUMN public.stores.theme_id IS 'Selected UI theme for the store';
