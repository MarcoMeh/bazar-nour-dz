-- Create delivery_companies table
CREATE TABLE IF NOT EXISTS public.delivery_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delivery_zones table
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.delivery_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_home DECIMAL(10, 2) NOT NULL DEFAULT 0,
    price_desk DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create zone_wilayas table
CREATE TABLE IF NOT EXISTS public.zone_wilayas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
    wilaya_code TEXT NOT NULL, -- References wilayas(code) logically
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create store_delivery_settings table
CREATE TABLE IF NOT EXISTS public.store_delivery_settings (
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.delivery_companies(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (store_id, company_id)
);

-- Create store_delivery_overrides table
CREATE TABLE IF NOT EXISTS public.store_delivery_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    wilaya_code TEXT NOT NULL,
    price_home DECIMAL(10, 2),
    price_desk DECIMAL(10, 2),
    is_home_enabled BOOLEAN DEFAULT true,
    is_desk_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(store_id, wilaya_code)
);

-- Enable RLS
ALTER TABLE public.delivery_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_delivery_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Delivery Companies: Public read, Admin write
CREATE POLICY "Public can view delivery companies" ON public.delivery_companies FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage delivery companies" ON public.delivery_companies FOR ALL USING (auth.role() = 'authenticated'); -- Assuming authenticated includes admin for now, refine if needed

-- Delivery Zones: Public read, Admin write
CREATE POLICY "Public can view delivery zones" ON public.delivery_zones FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage delivery zones" ON public.delivery_zones FOR ALL USING (auth.role() = 'authenticated');

-- Zone Wilayas: Public read, Admin write
CREATE POLICY "Public can view zone wilayas" ON public.zone_wilayas FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage zone wilayas" ON public.zone_wilayas FOR ALL USING (auth.role() = 'authenticated');

-- Store Delivery Settings: Public read, Store Owner write
CREATE POLICY "Public can view store delivery settings" ON public.store_delivery_settings FOR SELECT USING (true);
CREATE POLICY "Store owners can manage their settings" ON public.store_delivery_settings FOR ALL USING (auth.role() = 'authenticated'); -- Logic validation happens in app or trigger ideally

-- Store Delivery Overrides: Public read, Store Owner write
CREATE POLICY "Public can view store delivery overrides" ON public.store_delivery_overrides FOR SELECT USING (true);
CREATE POLICY "Store owners can manage their overrides" ON public.store_delivery_overrides FOR ALL USING (auth.role() = 'authenticated');

-- Seed Companies
INSERT INTO public.delivery_companies (name) VALUES 
('Yalidin'),
('ZRexpress'),
('DHD'),
('48Hr');
