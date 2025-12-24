-- Migration: Advanced Inventory Management
-- Description: Adds variant-level stock tracking and automates stock reduction during orders.

-- 1. Add tracking columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- 2. Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    color TEXT,
    size TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(product_id, color, size)
);

-- Ensure updated_at exists on product_variants
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Policies for product_variants
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view variants') THEN
CREATE POLICY "Public can view variants" ON public.product_variants FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Store owners can manage their product variants') THEN
CREATE POLICY "Store owners can manage their product variants" ON public.product_variants
    FOR ALL USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON p.store_id = s.id
            WHERE s.owner_id = auth.uid()
        )
    );
END IF; END $$;

-- 3. Trigger to update updated_at for product_variants
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    NEW.updated_at = now();
  EXCEPTION WHEN undefined_column THEN
    -- Ignore
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Re-implement create_order to handle inventory tracking
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
        ARRAY(SELECT jsonb_array_elements_text(order_payload->'store_ids')),
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

-- 5. Add Low Stock Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_low_stock_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_product_name TEXT;
    v_owner_id UUID;
    v_threshold INTEGER;
    v_store_id UUID;
BEGIN
    SELECT p.name_ar, p.low_stock_threshold, s.owner_id, s.id INTO v_product_name, v_threshold, v_owner_id, v_store_id
    FROM public.products p
    JOIN public.stores s ON p.store_id = s.id
    WHERE p.id = NEW.product_id;

    -- Only notify if stock dropped BELOW threshold and inventory is tracked
    IF NEW.stock_quantity <= v_threshold AND OLD.stock_quantity > v_threshold THEN

        IF v_store_id IS NOT NULL THEN
            INSERT INTO public.notifications (store_id, type, title, message)
            VALUES (
                v_store_id,
                'low_stock',
                'تنبيه: مخزون منخفض',
                'المنتج "' || v_product_name || '" (اللون: ' || COALESCE(NEW.color, 'غير محدد') || ', المقاس: ' || COALESCE(NEW.size, 'غير محدد') || ') أوشك على النفاد. الكمية المتبقية: ' || NEW.stock_quantity
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on reapplying
DROP TRIGGER IF EXISTS tr_low_stock_notification ON public.product_variants;

CREATE TRIGGER tr_low_stock_notification
AFTER UPDATE ON public.product_variants
FOR EACH ROW
WHEN (NEW.stock_quantity < OLD.stock_quantity)
EXECUTE FUNCTION public.handle_low_stock_notification();

-- Comment updates
COMMENT ON TABLE public.product_variants IS 'Detailed stock tracking for product color/size combinations';
COMMENT ON COLUMN public.products.track_inventory IS 'Whether to enforce stock limits for this product';
COMMENT ON COLUMN public.products.low_stock_threshold IS 'Stock level at which a notification is sent to the owner';
