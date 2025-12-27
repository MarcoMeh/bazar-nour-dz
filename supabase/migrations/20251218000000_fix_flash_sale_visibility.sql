CREATE OR REPLACE FUNCTION get_flash_sale_products_json()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_agg(row_to_json(p_data))
  FROM (
    SELECT 
      p.*,
      (
        SELECT json_build_object(
          'name', c.name,
          'parent', (
            -- Replicate the parent structure if it was intended to come from a different table or hierarchy
            -- For now, we'll try to get it from subcategories if possible, or leave null if parent_id is missing
            NULL::json
          )
        )
        FROM public.categories c
        WHERE c.id = p.category_id
      ) as categories,
      (
        SELECT json_build_object('name', s.name)
        FROM public.subcategories s
        WHERE s.id = p.subcategory_id
      ) as subcategory_data
    FROM public.products p
    JOIN public.flash_sale_items f ON p.id = f.product_id
    JOIN public.stores st ON p.store_id = st.id
    WHERE st.is_active = true 
      AND (st.is_manually_suspended IS FALSE OR st.is_manually_suspended IS NULL)
      AND (st.subscription_end_date > NOW() OR st.subscription_end_date IS NULL)
    ORDER BY f.created_at DESC
  ) p_data;
$$;

GRANT EXECUTE ON FUNCTION get_flash_sale_products_json() TO anon, authenticated;
