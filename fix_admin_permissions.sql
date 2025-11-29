-- Fix Admin Permissions for Orders and Order Items

-- 1. Orders: Allow admins to view ALL orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2. Orders: Allow admins to update ALL orders (e.g. status)
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 3. Order Items: Allow admins to view ALL order items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. Ensure Store Owners can also see their items (re-affirming existing logic if needed, but usually covered)
-- The existing policy "Store owners can see items for their orders" should cover this.

-- 5. Profiles: Ensure admins can view profiles (already public, but just in case)
-- "Public profiles are viewable by everyone." covers this.
