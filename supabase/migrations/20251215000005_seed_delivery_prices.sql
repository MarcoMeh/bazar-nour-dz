-- DATA SEEDING MIGRATION
-- This script populates the delivery_zones and zone_wilayas for the existing companies.
-- It assumes 'Yalidin', 'ZRexpress', 'DHD', '48Hr' exist in delivery_companies.

DO $$
DECLARE
    company_rec RECORD;
    zone_algiers_id UUID;
    zone_north_id UUID;
    zone_highlands_id UUID;
    zone_south_id UUID;
    
    -- Wilaya Groupings (Approximate)
    -- Algiers
    w_algiers text[] := ARRAY['16'];
    -- Coastal / Main North (cheaper)
    w_north text[] := ARRAY['09','15','35','24','21','23','18','42','06','19','25','10','22','31','46','13','27','02','48','44','36'];
    -- Interior / Highlands (mid-range)
    w_highlands text[] := ARRAY['01','03','04','05','07','12','14','20','26','28','29','34','38','40','41','43','45','47'];
    -- South (expensive)
    w_south text[] := ARRAY['08','11','17','30','32','33','37','39','49','50','51','52','53','54','55','56','57','58'];
    
    w_code text;
BEGIN
    FOR company_rec IN SELECT id, name FROM public.delivery_companies LOOP
        
        -- 1. ZONE: ALGIERS (Center)
        INSERT INTO public.delivery_zones (company_id, name, price_home, price_desk)
        VALUES (company_rec.id, 'الجزائر العاصمة', 400, 250)
        RETURNING id INTO zone_algiers_id;

        FOREACH w_code IN ARRAY w_algiers LOOP
            INSERT INTO public.zone_wilayas (zone_id, wilaya_code) VALUES (zone_algiers_id, w_code);
        END LOOP;

        -- 2. ZONE: NORTH (Coastal/Major Cities)
        INSERT INTO public.delivery_zones (company_id, name, price_home, price_desk)
        VALUES (company_rec.id, 'مدن الشمال والسواحل', 600, 400)
        RETURNING id INTO zone_north_id;

        FOREACH w_code IN ARRAY w_north LOOP
            INSERT INTO public.zone_wilayas (zone_id, wilaya_code) VALUES (zone_north_id, w_code);
        END LOOP;

        -- 3. ZONE: HIGHLANDS (Interior)
        INSERT INTO public.delivery_zones (company_id, name, price_home, price_desk)
        VALUES (company_rec.id, 'الهضاب العليا والداخلية', 800, 500)
        RETURNING id INTO zone_highlands_id;

        FOREACH w_code IN ARRAY w_highlands LOOP
            INSERT INTO public.zone_wilayas (zone_id, wilaya_code) VALUES (zone_highlands_id, w_code);
        END LOOP;

        -- 4. ZONE: SOUTH (Sahara)
        INSERT INTO public.delivery_zones (company_id, name, price_home, price_desk)
        VALUES (company_rec.id, 'الجنوب الكبير', 1000, 700) -- Prices vary by company, this is an average
        RETURNING id INTO zone_south_id;

        FOREACH w_code IN ARRAY w_south LOOP
            INSERT INTO public.zone_wilayas (zone_id, wilaya_code) VALUES (zone_south_id, w_code);
        END LOOP;
        
        RAISE NOTICE 'Seeded zones for company %', company_rec.name;
    END LOOP;
END $$;
