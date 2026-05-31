-- Migration: Make store_id nullable in store_push_subscriptions and add new store registration trigger
-- Description: Enables admins to register device tokens, and alerts them when a store owner registers.

-- 1. Make store_id nullable in store_push_subscriptions
ALTER TABLE public.store_push_subscriptions ALTER COLUMN store_id DROP NOT NULL;

-- 2. Create trigger function for store registration push notifications
CREATE OR REPLACE FUNCTION public.handle_new_store_registration_push_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_payload JSONB;
BEGIN
  v_payload := jsonb_build_object(
    'send_to_admins', true,
    'type', 'new_store_registration',
    'title', 'طلب تسجيل متجر جديد! 🏪',
    'message', 'قام التاجر ' || NEW.owner_name || ' بطلب تسجيل متجره: ' || NEW.store_name
  );

  -- Call the send-push-notification edge function asynchronously via pg_net
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to store_registration_requests table
DROP TRIGGER IF EXISTS on_store_registration_created_push ON public.store_registration_requests;
CREATE TRIGGER on_store_registration_created_push
  AFTER INSERT ON public.store_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_store_registration_push_trigger();
