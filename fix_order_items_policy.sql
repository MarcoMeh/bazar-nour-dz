-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

-- Recreate the policy with a cleaner check
CREATE POLICY "Users can insert order items" ON public.order_items
FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.orders WHERE id = order_id)
);

-- Ensure RLS is enabled
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users (just in case)
GRANT ALL ON public.order_items TO authenticated;
