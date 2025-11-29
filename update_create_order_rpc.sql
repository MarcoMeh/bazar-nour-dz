DROP FUNCTION IF EXISTS create_order(jsonb, jsonb);

CREATE OR REPLACE FUNCTION create_order(
  order_payload JSONB,
  items_payload JSONB
) RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
BEGIN
  -- Insert into orders table
  INSERT INTO public.orders (
    user_id,
    store_id,
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
