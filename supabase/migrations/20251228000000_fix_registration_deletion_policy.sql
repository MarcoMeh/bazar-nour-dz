-- Fix: Missing RLS policies for store_registration_requests
-- This migration ensures that admins can delete registration requests.
-- Corrected: Removed reference to non-existent 'admins' table.

-- 1. Enable RLS if not already enabled
ALTER TABLE public.store_registration_requests ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Anyone can create a registration request (used by SellerRegister page)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_registration_requests' AND policyname = 'Anyone can create registration requests'
) THEN
    CREATE POLICY "Anyone can create registration requests" ON public.store_registration_requests
    FOR INSERT WITH CHECK (true);
END IF; END $$;

-- 3. Policy: Admins can view all registration requests
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_registration_requests' AND policyname = 'Admins can view all registration requests'
) THEN
    CREATE POLICY "Admins can view all registration requests" ON public.store_registration_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );
END IF; END $$;

-- 4. Policy: Admins can update registration requests (for status changes)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_registration_requests' AND policyname = 'Admins can update registration requests'
) THEN
    CREATE POLICY "Admins can update registration requests" ON public.store_registration_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );
END IF; END $$;

-- 5. Policy: Admins can delete registration requests
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'store_registration_requests' AND policyname = 'Admins can delete registration requests'
) THEN
    CREATE POLICY "Admins can delete registration requests" ON public.store_registration_requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );
END IF; END $$;
