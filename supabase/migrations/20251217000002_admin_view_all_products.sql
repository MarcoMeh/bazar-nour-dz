-- Allow admins to view all products regardless of store status (e.g. expired subscription)
-- This ensures the admin panel can always list products for management or flash sales.

CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
