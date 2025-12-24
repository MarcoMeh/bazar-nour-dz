-- Add custom color columns to stores table
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS primary_color TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS secondary_color TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS background_color TEXT;
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS text_color TEXT;

-- Add check constraints to ensure valid hex codes (simple length check)
ALTER TABLE public.stores ADD CONSTRAINT check_primary_color_hex CHECK (char_length(primary_color) <= 9);
ALTER TABLE public.stores ADD CONSTRAINT check_secondary_color_hex CHECK (char_length(secondary_color) <= 9);
ALTER TABLE public.stores ADD CONSTRAINT check_background_color_hex CHECK (char_length(background_color) <= 9);
ALTER TABLE public.stores ADD CONSTRAINT check_text_color_hex CHECK (char_length(text_color) <= 9);
