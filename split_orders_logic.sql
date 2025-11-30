-- Add group_id to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS group_id UUID;

-- Update create_order to split orders by store
CREATE OR REPLACE FUNCTION create_order(
  order_payload JSONB,
  items_payload JSONB
) RETURNS UUID AS $$
DECLARE
  v_group_id UUID := gen_random_uuid(); -- Shared ID for the group
  v_store_id UUID;
  v_order_id UUID;
  v_item JSONB;
  v_store_items JSONB;
  v_sub_total DECIMAL;
  v_delivery_price DECIMAL;
  v_is_first BOOLEAN := TRUE;
  v_wilaya_id INTEGER;
  v_delivery_option TEXT;
BEGIN
  -- Get delivery details
  v_wilaya_id := (order_payload->>'wilaya_id')::INTEGER;
  v_delivery_option := order_payload->>'delivery_option';
  
  -- Fetch delivery price based on option
  SELECT 
    CASE 
      WHEN v_delivery_option = 'home' THEN home_delivery_price 
      ELSE desk_delivery_price 
    END INTO v_delivery_price
  FROM public.wilayas 
  WHERE id = v_wilaya_id;

  -- Group items by store_id and iterate
  -- We use a temporary table or CTE to group
  FOR v_store_id IN 
    SELECT DISTINCT (item->>'store_id')::UUID 
    FROM jsonb_array_elements(items_payload) AS item
    WHERE (item->>'store_id') IS NOT NULL
  LOOP
    -- Calculate sub-total for this store
    SELECT SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER)
    INTO v_sub_total
    FROM jsonb_array_elements(items_payload) AS item
    WHERE (item->>'store_id')::UUID = v_store_id;

    -- Add delivery price ONLY to the first order in the group
    IF v_is_first THEN
      v_sub_total := v_sub_total + COALESCE(v_delivery_price, 0);
      v_is_first := FALSE;
    END IF;

    -- Insert Order for this Store
    INSERT INTO public.orders (
      user_id,
      store_id,
      group_id, -- Shared Group ID
      full_name,
      phone,
      address,
      wilaya_id,
      delivery_option,
      total_price,
      status
    ) VALUES (
      (order_payload->>'user_id')::UUID,
      v_store_id,
      v_group_id,
      order_payload->>'full_name',
      order_payload->>'phone',
      order_payload->>'address',
      v_wilaya_id,
      v_delivery_option,
      v_sub_total,
      'pending'
    ) RETURNING id INTO v_order_id;

    -- Insert Items for this Store
    FOR v_item IN 
      SELECT * FROM jsonb_array_elements(items_payload)
      WHERE (value->>'store_id')::UUID = v_store_id
    LOOP
      INSERT INTO public.order_items (
        order_id,
        product_id,
        quantity,
        price,
        selected_color,
        selected_size
      ) VALUES (
        v_order_id,
        (v_item->>'product_id')::UUID,
        (v_item->>'quantity')::INTEGER,
        (v_item->>'price')::DECIMAL,
        v_item->>'selected_color',
        v_item->>'selected_size'
      );
    END LOOP;
  END LOOP;

  -- Return the Group ID (so frontend knows the reference)
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
