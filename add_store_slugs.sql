-- Add slug column to stores table
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Generate slugs for existing stores based on their names
-- This converts Arabic and English names to URL-friendly slugs
UPDATE public.stores 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g'))
WHERE slug IS NULL;

-- Remove trailing dashes
UPDATE public.stores 
SET slug = REGEXP_REPLACE(slug, '-+$', '', 'g')
WHERE slug LIKE '%-';

-- Remove leading dashes  
UPDATE public.stores 
SET slug = REGEXP_REPLACE(slug, '^-+', '', 'g')
WHERE slug LIKE '-%';
