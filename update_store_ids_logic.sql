-- Backfill store_ids for existing orders
UPDATE public.orders o
SET store_ids = ARRAY(
  SELECT DISTINCT p.store_id
  FROM public.order_items oi
  JOIN public.products p ON oi.product_id = p.id
  WHERE oi.order_id = o.id
  AND p.store_id IS NOT NULL
)
WHERE store_ids IS NULL;

-- Update get_store_orders to use store_ids column (more efficient)
CREATE OR REPLACE FUNCTION get_store_orders(p_store_id UUID)
RETURNS SETOF public.orders AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.orders
  WHERE p_store_id = ANY(store_ids)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
