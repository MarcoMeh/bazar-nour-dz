-- Migration: Add delivery_price to orders table
-- Description: Ensures the delivery_price column exists in the orders table.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_price DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Fix create_order function to handle uuid[] cast for store_ids
CREATE OR REPLACE FUNCTION public.create_order(
    order_payload JSONB,
    items_payload JSONB
)
RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_item RECORD;
    v_variant_id UUID;
    v_current_stock INTEGER;
    v_track_inv BOOLEAN;
BEGIN
    -- 1. Create the order record
    INSERT INTO public.orders (
        store_id,
        store_ids,
        user_id,
        wilaya_id,
        full_name,
        phone,
        address,
        delivery_option,
        total_price,
        delivery_price,
        status
    )
    VALUES (
        (order_payload->>'store_id')::UUID,
        ARRAY(SELECT (jsonb_array_elements_text(order_payload->'store_ids'))::UUID),
        (order_payload->>'user_id')::UUID,
        (order_payload->>'wilaya_id')::INTEGER,
        (order_payload->>'full_name'),
        (order_payload->>'phone'),
        (order_payload->>'address'),
        (order_payload->>'delivery_option'),
        (order_payload->>'total_price')::NUMERIC,
        (order_payload->>'delivery_price')::NUMERIC,
        'pending'
    )
    RETURNING id INTO v_order_id;

    -- 2. Process items and update stock
    FOR v_item IN SELECT * FROM jsonb_to_recordset(items_payload) AS x(
        product_id UUID, 
        quantity INTEGER, 
        price NUMERIC, 
        selected_color TEXT, 
        selected_size TEXT
    )
    LOOP
        -- Check if product tracks inventory
        SELECT track_inventory INTO v_track_inv FROM public.products WHERE id = v_item.product_id;

        IF v_track_inv THEN
            -- Find specific variant
            SELECT id, stock_quantity INTO v_variant_id, v_current_stock 
            FROM public.product_variants 
            WHERE product_id = v_item.product_id 
              AND (color = v_item.selected_color OR (color IS NULL AND v_item.selected_color IS NULL))
              AND (size = v_item.selected_size OR (size IS NULL AND v_item.selected_size IS NULL));

            IF v_variant_id IS NULL THEN
                RAISE EXCEPTION 'المنتج المختار (اللون: %, المقاس: %) غير متوفر في المخزون لنظام التتبع.', 
                    COALESCE(v_item.selected_color, 'افتراضي'), 
                    COALESCE(v_item.selected_size, 'افتراضي');
            END IF;

            IF v_current_stock < v_item.quantity THEN
                RAISE EXCEPTION 'الكمية المطلوبة غير متوفرة لـ %. المتبقي: %', 
                    (SELECT name_ar FROM public.products WHERE id = v_item.product_id),
                    v_current_stock;
            END IF;

            -- Deduct stock
            UPDATE public.product_variants 
            SET stock_quantity = stock_quantity - v_item.quantity 
            WHERE id = v_variant_id;
            
            -- Check if we should mark product as sold out
            IF NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = v_item.product_id AND stock_quantity > 0) THEN
                UPDATE public.products SET is_sold_out = TRUE WHERE id = v_item.product_id;
            END IF;
        END IF;

        -- Create order_items record
        INSERT INTO public.order_items (
            order_id,
            product_id,
            quantity,
            price,
            selected_color,
            selected_size
        )
        VALUES (
            v_order_id,
            v_item.product_id,
            v_item.quantity,
            v_item.price,
            v_item.selected_color,
            v_item.selected_size
        );
    END LOOP;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
