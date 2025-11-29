CREATE OR REPLACE FUNCTION create_order(
  order_payload JSONB,
  items_payload JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
AS $$
DECLARE
  new_order_id UUID;
  item JSONB;
BEGIN
  -- Insert the order
  INSERT INTO public.orders (
    user_id,
    store_id,
    wilaya_id,
    full_name,
    phone,
    address,
    delivery_option,
    total_price,
    status
  ) VALUES (
    (order_payload->>'user_id')::UUID,
    (order_payload->>'store_id')::UUID, -- Can be null
    (order_payload->>'wilaya_id')::INTEGER,
    order_payload->>'full_name',
    order_payload->>'phone',
    order_payload->>'address',
    order_payload->>'delivery_option',
    (order_payload->>'total_price')::NUMERIC,
    'pending'
  ) RETURNING id INTO new_order_id;

  -- Insert items
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
      (item->>'price')::NUMERIC,
      item->>'selected_color', -- Can be null
      item->>'selected_size'   -- Can be null
    );
  END LOOP;

  RETURN jsonb_build_object('id', new_order_id);
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Failed to create order: %', SQLERRM;
END;
$$;
