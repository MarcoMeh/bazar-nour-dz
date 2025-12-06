-- Add new columns for Home Page control
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS flash_sale_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS trending_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS newsletter_visible boolean DEFAULT true;

-- Update existing row to ensure defaults are set (optional, but good practice)
UPDATE public.site_settings
SET 
  flash_sale_visible = true,
  trending_visible = true,
  newsletter_visible = true
WHERE id = 1;
