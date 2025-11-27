-- Add slug column to categories if it doesn't exist
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS slug text;

-- Add slug column to subcategories if it doesn't exist
ALTER TABLE public.subcategories 
ADD COLUMN IF NOT EXISTS slug text;

-- Optional: Make slug unique
ALTER TABLE public.categories 
ADD CONSTRAINT categories_slug_key UNIQUE (slug);

ALTER TABLE public.subcategories 
ADD CONSTRAINT subcategories_slug_key UNIQUE (slug);
