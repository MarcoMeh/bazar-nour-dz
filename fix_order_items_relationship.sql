-- 1. Check if the foreign key exists (for debugging purposes, visible in output)
SELECT conname
FROM pg_constraint
WHERE conrelid = 'public.order_items'::regclass
  AND confrelid = 'public.orders'::regclass;

-- 2. Re-create the Foreign Key to be absolutely sure and force schema cache refresh
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;

-- 3. Verify the column name is actually 'order_id'
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'order_items' AND column_name = 'order_id';

-- 4. Reload the schema cache (Supabase specific trick: notifying pgrst)
NOTIFY pgrst, 'reload config';
