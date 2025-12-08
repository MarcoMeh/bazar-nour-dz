-- Add DELETE policy for Store Owners on orders
-- This allows store owners to delete orders that belong to their store

DROP POLICY IF EXISTS "Store Owners can delete their orders" ON public.orders;
CREATE POLICY "Store Owners can delete their orders"
ON public.orders
FOR DELETE
TO authenticated
USING (
  is_store_owner()
  AND (
    -- Match single store_id
    store_id IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
    OR
    -- Match any in store_ids array
    EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.owner_id = auth.uid()
        AND s.id = ANY(orders.store_ids)
    )
  )
);

-- Add UPDATE policy for Store Owners on orders (for status changes)
DROP POLICY IF EXISTS "Store Owners can update their orders" ON public.orders;
CREATE POLICY "Store Owners can update their orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  is_store_owner()
  AND (
    -- Match single store_id
    store_id IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
    OR
    -- Match any in store_ids array
    EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.owner_id = auth.uid()
        AND s.id = ANY(orders.store_ids)
    )
  )
)
WITH CHECK (
  is_store_owner()
  AND (
    store_id IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.owner_id = auth.uid()
        AND s.id = ANY(orders.store_ids)
    )
  )
);

-- Add DELETE policy for Store Owners on order_items (needed to delete items before order)
DROP POLICY IF EXISTS "Store Owners can delete order_items for their orders" ON public.order_items;
CREATE POLICY "Store Owners can delete order_items for their orders"
ON public.order_items
FOR DELETE
TO authenticated
USING (
  is_store_owner()
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (
      o.store_id IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.owner_id = auth.uid()
        AND s.id = ANY(o.store_ids)
      )
    )
  )
);

-- Also add SELECT policy for order_items for store owners
DROP POLICY IF EXISTS "Store Owners can view their order_items" ON public.order_items;
CREATE POLICY "Store Owners can view their order_items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  is_store_owner()
  AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
    AND (
      o.store_id IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.owner_id = auth.uid()
        AND s.id = ANY(o.store_ids)
      )
    )
  )
);
