-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    influencer_name TEXT NOT NULL,
    influencer_phone TEXT,
    discount_price NUMERIC DEFAULT 2000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add promo_code column to store_registration_requests
ALTER TABLE public.store_registration_requests 
ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policies for promo_codes
CREATE POLICY "Allow public read access to active promo codes" 
ON public.promo_codes FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin full access to promo codes" 
ON public.promo_codes FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
