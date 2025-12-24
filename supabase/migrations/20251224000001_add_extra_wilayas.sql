-- Add the extra 11 wilayas
-- FIX: Use WHERE NOT EXISTS instead of ON CONFLICT to avoid constraint errors if UNIQUE index is missing.

INSERT INTO public.wilayas (code, name_ar)
SELECT d.code, d.name_ar
FROM (VALUES
  ('59', 'آفلو'),
  ('60', 'بريكة'),
  ('61', 'القنطرة'),
  ('62', 'بئر العاتر'),
  ('63', 'العريشة'),
  ('64', 'قصر الشلالة'),
  ('65', 'عين وسارة'),
  ('66', 'مسعد'),
  ('67', 'قصر البخاري'),
  ('68', 'بوسعادة'),
  ('69', 'الأبيض سيدي الشيخ')
) AS d(code, name_ar)
WHERE NOT EXISTS (
  SELECT 1 FROM public.wilayas WHERE code = d.code
);

-- Assign these new wilayas to existing delivery zones for all companies
-- Heuristic: 59-68 -> Highlands (الهضاب), 69 -> South (الجنوب)

DO $$
DECLARE
    company_rec RECORD;
    zone_highlands_id UUID;
    zone_south_id UUID;
    w_highlands text[] := ARRAY['59','60','61','62','63','64','65','66','67','68'];
    w_south text[] := ARRAY['69'];
    w_code text;
BEGIN
    FOR company_rec IN SELECT id, name FROM public.delivery_companies LOOP
        
        -- Find Highlands Zone for this company (fuzzy match)
        SELECT id INTO zone_highlands_id 
        FROM public.delivery_zones 
        WHERE company_id = company_rec.id AND (name LIKE '%الهضاب%' OR name LIKE '%Highlands%')
        LIMIT 1;

        -- Find South Zone for this company
        SELECT id INTO zone_south_id 
        FROM public.delivery_zones 
        WHERE company_id = company_rec.id AND (name LIKE '%الجنوب%' OR name LIKE '%South%')
        LIMIT 1;

        -- Insert Highlands Wilayas
        IF zone_highlands_id IS NOT NULL THEN
            FOREACH w_code IN ARRAY w_highlands LOOP
                BEGIN
                    INSERT INTO public.zone_wilayas (zone_id, wilaya_code) VALUES (zone_highlands_id, w_code);
                EXCEPTION WHEN unique_violation THEN
                    -- Skip if already exists
                END;
            END LOOP;
        END IF;

        -- Insert South Wilayas
        IF zone_south_id IS NOT NULL THEN
            FOREACH w_code IN ARRAY w_south LOOP
                BEGIN
                    INSERT INTO public.zone_wilayas (zone_id, wilaya_code) VALUES (zone_south_id, w_code);
                EXCEPTION WHEN unique_violation THEN
                    -- Skip if already exists
                END;
            END LOOP;
        END IF;

    END LOOP;
END $$;
