-- Create flash_sale_items table for separate management
CREATE TABLE IF NOT EXISTS public.flash_sale_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT flash_sale_items_product_id_key UNIQUE (product_id)
);

-- Enable RLS
ALTER TABLE public.flash_sale_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON public.flash_sale_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.flash_sale_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.flash_sale_items FOR DELETE USING (auth.role() = 'authenticated');

-- Clean up products table
ALTER TABLE public.products DROP COLUMN IF EXISTS is_flash_sale;
