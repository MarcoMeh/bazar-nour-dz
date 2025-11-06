-- Add images array column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Add a comment to explain the column
COMMENT ON COLUMN products.images IS 'Array of additional product image URLs in JSON format';