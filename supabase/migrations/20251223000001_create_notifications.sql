-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Stores can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() IN (
    SELECT owner_id FROM public.stores WHERE id = notifications.store_id
  ));

CREATE POLICY "Stores can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() IN (
    SELECT owner_id FROM public.stores WHERE id = notifications.store_id
  ));

-- Trigger Function for New Order Notification
CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the store owner
  -- We assume one store per order for now, as handled in Checkout.tsx
  IF NEW.store_id IS NOT NULL THEN
    INSERT INTO public.notifications (store_id, type, title, message, order_id)
    VALUES (
      NEW.store_id,
      'new_order',
      'طلب جديد!',
      'لقد تلقيت طلباً جديداً من ' || NEW.full_name,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on insert to orders
CREATE TRIGGER on_order_created_notification
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order_notification();

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
