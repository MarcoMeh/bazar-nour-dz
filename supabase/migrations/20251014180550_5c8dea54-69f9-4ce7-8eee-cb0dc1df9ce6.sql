-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure categories columns exist
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure product columns exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS store_id UUID;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Ensure name column is nullable
ALTER TABLE public.products ALTER COLUMN name DROP NOT NULL;

-- Create wilayas table with delivery prices
CREATE TABLE IF NOT EXISTS public.wilayas (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT, -- English name, made nullable to avoid constraint errors
  name_ar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure delivery_price exists
ALTER TABLE public.wilayas ADD COLUMN IF NOT EXISTS delivery_price DECIMAL(10, 2) NOT NULL DEFAULT 400;

-- Ensure name column is nullable if it already exists
ALTER TABLE public.wilayas ALTER COLUMN name DROP NOT NULL;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  wilaya_code TEXT,
  delivery_type TEXT NOT NULL DEFAULT 'home',
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  delivery_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  items JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure modern column names exist (added in later updates but might be missing on clean installs if not tracked here)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_option TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS wilaya_id INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_ids UUID[];
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS group_id UUID;

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, products, and wilayas
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view categories') THEN
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view products') THEN
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view wilayas') THEN
CREATE POLICY "Public can view wilayas" ON public.wilayas FOR SELECT USING (true);
END IF; END $$;

-- Only authenticated users (admin) can modify
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage categories') THEN
CREATE POLICY "Authenticated can manage categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage products') THEN
CREATE POLICY "Authenticated can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can manage wilayas') THEN
CREATE POLICY "Authenticated can manage wilayas" ON public.wilayas FOR ALL USING (auth.role() = 'authenticated');
END IF; END $$;

-- Public can create orders, admin can view all
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create orders') THEN
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can view orders') THEN
CREATE POLICY "Authenticated can view orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can update orders') THEN
CREATE POLICY "Authenticated can update orders" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');
END IF; END $$;

-- CLEANUP: Remove duplicated wilayas if any (keeping the latest ID)
-- DELETE FROM public.wilayas a USING public.wilayas b WHERE a.id < b.id AND a.code = b.code;

-- CLEANUP: Remove demo data (Careful: This template assumes these slugs/names are for demo only)
-- DELETE FROM public.products WHERE name IN ('Summer Dress', 'Wireless Headphones');
-- DELETE FROM public.categories WHERE slug IN ('clothing', 'electronics', 'decoration', 'beauty');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    NEW.updated_at = now();
  EXCEPTION WHEN undefined_column THEN
    -- Table doesn't have updated_at column, skip silently
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();