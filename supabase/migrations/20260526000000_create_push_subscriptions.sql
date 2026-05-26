-- Migration: Create store_push_subscriptions table and triggers for push notifications
-- Description: Stores push subscription tokens for merchants and calls Edge Function when notifications are created.

-- 1. Create store_push_subscriptions table
CREATE TABLE IF NOT EXISTS public.store_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.store_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Users can insert their own push subscriptions"
  ON public.store_push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Store owners can view their own push subscriptions"
  ON public.store_push_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT owner_id FROM public.stores WHERE id = store_push_subscriptions.store_id
  ));

CREATE POLICY "Store owners can delete their own push subscriptions"
  ON public.store_push_subscriptions FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT owner_id FROM public.stores WHERE id = store_push_subscriptions.store_id
  ));

-- 4. Create trigger function to invoke the edge function via pg_net
CREATE OR REPLACE FUNCTION public.handle_notification_push_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_payload JSONB;
BEGIN
  -- Only execute if store_id is present
  IF NEW.store_id IS NOT NULL THEN
    v_payload := jsonb_build_object(
      'notification_id', NEW.id,
      'store_id', NEW.store_id,
      'type', NEW.type,
      'title', NEW.title,
      'message', NEW.message
    );

    -- Call the send-push-notification edge function asynchronously
    PERFORM net.http_post(
      url := 'https://memumytcrjokqbpzsuok.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', COALESCE(
          current_setting('request.headers', true)::jsonb->>'authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbXVteXRjcmpva3FicHpzdW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzcyOTYsImV4cCI6MjA3OTMxMzI5Nn0.CyYOwPImh1B-QblL6C3CI_iEqVlDxbGWD5thOzWyg58'
        )
      ),
      body := v_payload,
      timeout_milliseconds := 5000
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the trigger to public.notifications table
DROP TRIGGER IF EXISTS on_notification_created_push ON public.notifications;
CREATE TRIGGER on_notification_created_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notification_push_trigger();
