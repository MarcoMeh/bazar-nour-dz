
-- Final Comprehensive Fix for Store Deletion
-- This migration ensures ALL potential blocking constraints are set to CASCADE

-- 1. Table: subscription_logs (Referencing stores)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_logs') THEN
        -- Try to drop constraint if it exists (names can vary)
        ALTER TABLE public.subscription_logs DROP CONSTRAINT IF EXISTS subscription_logs_store_id_fkey;
        -- Add it with CASCADE
        ALTER TABLE public.subscription_logs
        ADD CONSTRAINT subscription_logs_store_id_fkey 
            FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Table: products (Referencing stores)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_store_id_fkey;
        ALTER TABLE public.products
        ADD CONSTRAINT products_store_id_fkey 
            FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Table: reviews (Referencing products)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
        ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;
        ALTER TABLE public.reviews
        ADD CONSTRAINT reviews_product_id_fkey 
            FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Table: order_items (Referencing products and orders)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
        ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
        ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
        
        ALTER TABLE public.order_items
        ADD CONSTRAINT order_items_product_id_fkey 
            FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
            
        ALTER TABLE public.order_items
        ADD CONSTRAINT order_items_order_id_fkey 
            FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Table: orders (Referencing stores)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_store_id_fkey;
        -- Note: store_id in orders might not always be an FK, but we'll try to set it if column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'store_id') THEN
            ALTER TABLE public.orders
            ADD CONSTRAINT orders_store_id_fkey 
                FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;
