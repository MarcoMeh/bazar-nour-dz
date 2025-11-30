-- Add store_ids column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_ids UUID[];

-- Update create_order RPC to accept and save store_ids
CREATE OR REPLACE FUNCTION create_order(
  order_payload JSONB,
  items_payload JSONB
) RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
  p_store_ids UUID[];
BEGIN
  -- Extract store_ids from payload (assuming it's passed as a JSON array)
  -- We need to cast the JSON array to UUID[]
  SELECT ARRAY(SELECT jsonb_array_elements_text(order_payload->'store_ids')::UUID) INTO p_store_ids;

  -- Insert into orders table
  INSERT INTO public.orders (
    user_id,
    store_id,
    store_ids, -- NEW COLUMN
    full_name,
    phone,
    address,
    wilaya_id,
    delivery_option,
    total_price,
    status
  ) VALUES (
    (order_payload->>'user_id')::UUID,
    (order_payload->>'store_id')::UUID,
    p_store_ids, -- Insert the array
    order_payload->>'full_name',
    order_payload->>'phone',
    order_payload->>'address',
    (order_payload->>'wilaya_id')::INTEGER,
    order_payload->>'delivery_option',
    (order_payload->>'total_price')::DECIMAL,
    'pending'
  ) RETURNING id INTO new_order_id;

  -- Insert order items
  FOR item IN SELECT * FROM jsonb_array_elements(items_payload)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      quantity,
      price,
      selected_color,
      selected_size
    ) VALUES (
      new_order_id,
      (item->>'product_id')::UUID,
      (item->>'quantity')::INTEGER,
      (item->>'price')::DECIMAL,
      item->>'selected_color',
      item->>'selected_size'
    );
  END LOOP;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
