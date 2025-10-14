-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wilayas table with delivery prices
CREATE TABLE IF NOT EXISTS public.wilayas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  delivery_price DECIMAL(10, 2) NOT NULL DEFAULT 400,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  wilaya_code TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('home', 'office')),
  total_price DECIMAL(10, 2) NOT NULL,
  delivery_price DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, products, and wilayas
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view wilayas" ON public.wilayas FOR SELECT USING (true);

-- Only authenticated users (admin) can modify
CREATE POLICY "Authenticated can manage categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage wilayas" ON public.wilayas FOR ALL USING (auth.role() = 'authenticated');

-- Public can create orders, admin can view all
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can view orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update orders" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert Algerian wilayas
INSERT INTO public.wilayas (code, name_ar, delivery_price) VALUES
('01', 'أدرار', 400),
('02', 'الشلف', 400),
('03', 'الأغواط', 400),
('04', 'أم البواقي', 400),
('05', 'باتنة', 400),
('06', 'بجاية', 400),
('07', 'بسكرة', 400),
('08', 'بشار', 400),
('09', 'البليدة', 400),
('10', 'البويرة', 400),
('11', 'تمنراست', 400),
('12', 'تبسة', 400),
('13', 'تلمسان', 400),
('14', 'تيارت', 400),
('15', 'تيزي وزو', 400),
('16', 'الجزائر', 400),
('17', 'الجلفة', 400),
('18', 'جيجل', 400),
('19', 'سطيف', 400),
('20', 'سعيدة', 400),
('21', 'سكيكدة', 400),
('22', 'سيدي بلعباس', 400),
('23', 'عنابة', 400),
('24', 'قالمة', 400),
('25', 'قسنطينة', 400),
('26', 'المدية', 400),
('27', 'مستغانم', 400),
('28', 'المسيلة', 400),
('29', 'معسكر', 400),
('30', 'ورقلة', 400),
('31', 'وهران', 400),
('32', 'البيض', 400),
('33', 'إليزي', 400),
('34', 'برج بوعريريج', 400),
('35', 'بومرداس', 400),
('36', 'الطارف', 400),
('37', 'تندوف', 400),
('38', 'تيسمسيلت', 400),
('39', 'الوادي', 400),
('40', 'خنشلة', 400),
('41', 'سوق أهراس', 400),
('42', 'تيبازة', 400),
('43', 'ميلة', 400),
('44', 'عين الدفلى', 400),
('45', 'النعامة', 400),
('46', 'عين تموشنت', 400),
('47', 'غرداية', 400),
('48', 'غليزان', 400),
('49', 'تيميمون', 400),
('50', 'برج باجي مختار', 400),
('51', 'أولاد جلال', 400),
('52', 'بني عباس', 400),
('53', 'عين صالح', 400),
('54', 'عين قزام', 400),
('55', 'تقرت', 400),
('56', 'جانت', 400),
('57', 'المغير', 400),
('58', 'المنيعة', 400);

-- Insert sample categories
INSERT INTO public.categories (name, name_ar, slug) VALUES
('Clothing', 'ملابس', 'clothing'),
('Electronics', 'إلكترونيات', 'electronics'),
('Decoration', 'ديكور', 'decoration'),
('Beauty', 'مواد تجميل', 'beauty');

-- Insert sample products
INSERT INTO public.products (category_id, name, name_ar, description, description_ar, price, image_url) 
SELECT 
  c.id,
  'Summer Dress',
  'فستان صيفي',
  'Beautiful summer dress for women',
  'فستان صيفي جميل للنساء',
  2500.00,
  ''
FROM public.categories c WHERE c.slug = 'clothing';

INSERT INTO public.products (category_id, name, name_ar, description, description_ar, price, image_url) 
SELECT 
  c.id,
  'Wireless Headphones',
  'سماعات لاسلكية',
  'High-quality wireless headphones',
  'سماعات لاسلكية عالية الجودة',
  4500.00,
  ''
FROM public.categories c WHERE c.slug = 'electronics';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for products table
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();