-- Create wilayas table
CREATE TABLE IF NOT EXISTS public.wilayas (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    home_delivery_price DECIMAL(10, 2) DEFAULT 0,
    desk_delivery_price DECIMAL(10, 2) DEFAULT 0,
    home_delivery_available BOOLEAN DEFAULT TRUE,
    desk_delivery_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow read access to everyone (public)
CREATE POLICY "Allow public read access" ON public.wilayas
    FOR SELECT USING (true);

-- Allow full access to admins only
CREATE POLICY "Allow admin full access" ON public.wilayas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Populate Data (58 Wilayas)
INSERT INTO public.wilayas (code, name, name_ar, home_delivery_price, desk_delivery_price) VALUES
('01', 'Adrar', 'أدرار', 1500, 1000),
('02', 'Chlef', 'الشلف', 800, 500),
('03', 'Laghouat', 'الأغواط', 900, 600),
('04', 'Oum El Bouaghi', 'أم البواقي', 800, 500),
('05', 'Batna', 'باتنة', 800, 500),
('06', 'Béjaïa', 'بجاية', 800, 500),
('07', 'Biskra', 'بسكرة', 900, 600),
('08', 'Béchar', 'بشار', 1200, 800),
('09', 'Blida', 'البليدة', 600, 400),
('10', 'Bouira', 'البويرة', 700, 450),
('11', 'Tamanrasset', 'تمنراست', 1800, 1200),
('12', 'Tébessa', 'تبسة', 900, 600),
('13', 'Tlemcen', 'تلمسان', 900, 600),
('14', 'Tiaret', 'تيارت', 900, 600),
('15', 'Tizi Ouzou', 'تيزي وزو', 700, 450),
('16', 'Alger', 'الجزائر', 500, 300),
('17', 'Djelfa', 'الجلفة', 900, 600),
('18', 'Jijel', 'جيجل', 800, 500),
('19', 'Sétif', 'سطيف', 700, 450),
('20', 'Saïda', 'سعيدة', 900, 600),
('21', 'Skikda', 'سكيكدة', 800, 500),
('22', 'Sidi Bel Abbès', 'سيدي بلعباس', 900, 600),
('23', 'Annaba', 'عنابة', 800, 500),
('24', 'Guelma', 'قالمة', 800, 500),
('25', 'Constantine', 'قسنطينة', 700, 450),
('26', 'Médéa', 'المدية', 700, 450),
('27', 'Mostaganem', 'مستغانم', 800, 500),
('28', 'M''Sila', 'المسيلة', 800, 500),
('29', 'Mascara', 'معسكر', 900, 600),
('30', 'Ouargla', 'ورقلة', 1000, 700),
('31', 'Oran', 'وهران', 700, 450),
('32', 'El Bayadh', 'البيض', 1000, 700),
('33', 'Illizi', 'إليزي', 1800, 1200),
('34', 'Bordj Bou Arreridj', 'برج بوعريريج', 700, 450),
('35', 'Boumerdès', 'بومرداس', 600, 400),
('36', 'El Tarf', 'الطرف', 900, 600),
('37', 'Tindouf', 'تندوف', 1800, 1200),
('38', 'Tissemsilt', 'تيسمسيلت', 900, 600),
('39', 'El Oued', 'الوادي', 1000, 700),
('40', 'Khenchela', 'خنشلة', 900, 600),
('41', 'Souk Ahras', 'سوق أهراس', 900, 600),
('42', 'Tipaza', 'تيبازة', 600, 400),
('43', 'Mila', 'ميلة', 800, 500),
('44', 'Aïn Defla', 'عين الدفلى', 700, 450),
('45', 'Naâma', 'النعامة', 1000, 700),
('46', 'Aïn Témouchent', 'عين تموشنت', 900, 600),
('47', 'Ghardaïa', 'غرداية', 1000, 700),
('48', 'Relizane', 'غليزان', 800, 500),
('49', 'Timimoun', 'تيميمون', 1500, 1000),
('50', 'Bordj Badji Mokhtar', 'برج باجي مختار', 1800, 1200),
('51', 'Ouled Djellal', 'أولاد جلال', 900, 600),
('52', 'Béni Abbès', 'بني عباس', 1200, 800),
('53', 'In Salah', 'عين صالح', 1500, 1000),
('54', 'In Guezzam', 'عين قزام', 1800, 1200),
('55', 'Touggourt', 'تقرت', 1000, 700),
('56', 'Djanet', 'جانت', 1800, 1200),
('57', 'El M''Ghair', 'المغير', 1000, 700),
('58', 'El Meniaa', 'المنيعة', 1000, 700)
ON CONFLICT (id) DO NOTHING;
