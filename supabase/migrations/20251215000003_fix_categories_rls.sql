-- Ensure categories table is readable by everyone
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' AND policyname = 'Public can view categories'
  ) THEN
    CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
  END IF;
END $$;

-- Also ensure store_categories is readable (just in case)
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'store_categories' AND policyname = 'Public can view store_categories'
  ) THEN
    CREATE POLICY "Public can view store_categories" ON public.store_categories FOR SELECT USING (true);
  END IF;
END $$;
