-- Create a secure function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a secure function to check if user is store owner (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_store_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'store_owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy for Admins to view ALL orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  is_admin()
);

-- Policy for Store Owners to view their own orders
DROP POLICY IF EXISTS "Store Owners can view their orders" ON public.orders;
CREATE POLICY "Store Owners can view their orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  is_store_owner()
  AND (
    -- Match single store_id
    store_id IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
    OR
    -- Match any in store_ids array
    EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.owner_id = auth.uid()
        AND s.id = ANY(orders.store_ids)
    )
  )
);

-- Policy for Admins to view ALL order_items
DROP POLICY IF EXISTS "Admins can view all order_items" ON public.order_items;
CREATE POLICY "Admins can view all order_items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  is_admin()
);

-- Policy for Admins to view ALL products
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (
  is_admin()
);

-- Policy for Admins to view ALL stores
DROP POLICY IF EXISTS "Admins can view all stores" ON public.stores;
CREATE POLICY "Admins can view all stores"
ON public.stores
FOR SELECT
TO authenticated
USING (
  is_admin()
);

-- Policy for Store Owners to view their own store
DROP POLICY IF EXISTS "Store Owners can view their own store" ON public.stores;
CREATE POLICY "Store Owners can view their own store"
ON public.stores
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
);

-- Ensure Profiles are readable
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Allow Admins to view all profiles (using the secure function to avoid recursion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_admin()
);
