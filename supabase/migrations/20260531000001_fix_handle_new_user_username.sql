-- Migration: Fix handle_new_user trigger function
-- Description: Avoids duplicate key violations on username column by storing NULL instead of an empty string when the username is not provided.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := new.raw_user_meta_data->>'username';
  -- Convert empty string to NULL to prevent UNIQUE constraint violation
  IF v_username = '' THEN
    v_username := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, role, full_name, phone, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    v_username
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
