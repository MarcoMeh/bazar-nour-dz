-- Make store_id nullable to support multi-store orders
ALTER TABLE public.orders ALTER COLUMN store_id DROP NOT NULL;

-- Create RPC to get orders for a specific store (including multi-store orders)
CREATE OR REPLACE FUNCTION get_store_orders(p_store_id UUID)
RETURNS SETOF public.orders AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT o.*
  FROM public.orders o
  JOIN public.order_items oi ON o.id = oi.order_id
  JOIN public.products p ON oi.product_id = p.id
  WHERE p.store_id = p_store_id
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_store_orders(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_store_orders(UUID) TO service_role;
