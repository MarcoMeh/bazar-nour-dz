-- Enable RLS on wilayas (if not already)
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;

-- Allow EVERYONE (authenticated users) to view wilayas
-- Since this is just a list of states/provinces, it should be readable by all logged-in users.
DROP POLICY IF EXISTS "Everyone can view wilayas" ON public.wilayas;
CREATE POLICY "Everyone can view wilayas"
ON public.wilayas
FOR SELECT
TO authenticated
USING (true);

-- Also ensure the 'stores' policy is definitely correct for Admins
-- (Re-applying this specific one just to be safe)
DROP POLICY IF EXISTS "Admins can view all stores" ON public.stores;
CREATE POLICY "Admins can view all stores"
ON public.stores
FOR SELECT
TO authenticated
USING (
  is_admin()
);
