-- Force fix for notification trigger
-- In case the previous migration was applied with the 'customer_name' typo

-- 1. Drop the existing trigger first
DROP TRIGGER IF EXISTS on_order_created_notification ON public.orders;

-- 2. Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_order_notification();

-- 3. Re-create the function with the correct field name (full_name)
CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the store owner
  -- 'full_name' is the correct column name in the orders table
  IF NEW.store_id IS NOT NULL THEN
    INSERT INTO public.notifications (store_id, type, title, message, order_id)
    VALUES (
      NEW.store_id,
      'new_order',
      'طلب جديد!',
      'لقد تلقيت طلباً جديداً من ' || COALESCE(NEW.full_name, 'عميل'),
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-attach the trigger
CREATE TRIGGER on_order_created_notification
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order_notification();
