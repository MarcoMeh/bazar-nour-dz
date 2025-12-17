-- Add name_ar column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name_ar') THEN
        ALTER TABLE products ADD COLUMN name_ar TEXT;
    END IF;
END $$;
