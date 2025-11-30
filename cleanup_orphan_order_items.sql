-- 1. Delete orphan order_items (items that point to a non-existent order)
DELETE FROM public.order_items
WHERE order_id NOT IN (SELECT id FROM public.orders);

-- 2. Now that the data is clean, re-create the Foreign Key
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;

-- 3. Notify Supabase to refresh schema cache
NOTIFY pgrst, 'reload config';
