-- Allow public access to products that are in the flash sale, regardless of store status
-- This ensures that if an admin adds a product to Flash Sale, it is visible even if the store is technically expired/suspended (or just inactive).

CREATE POLICY "Public can view flash sale products" 
ON public.products 
FOR SELECT 
TO anon, authenticated 
USING (
    id IN (SELECT product_id FROM public.flash_sale_items)
);
