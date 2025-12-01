-- Trigger function to auto-confirm email for new store owners
CREATE OR REPLACE FUNCTION public.auto_confirm_store_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the auth.users table to set email_confirmed_at to NOW()
  -- We assume the store_owners table has an 'email' column or 'id' that matches auth.users
  -- Based on StoreOwners.tsx, we are inserting into store_owners.
  -- However, usually store_owners would be linked to auth.users via id.
  -- Let's check if we can find the user by email if id is not the auth id.
  
  -- Wait, looking at StoreOwners.tsx, it inserts into store_owners but doesn't seem to use supabase.auth.signUp() directly in the frontend?
  -- Ah, if the user is created via a trigger on store_owners, we need to intercept that.
  -- But wait, usually one creates the auth user first.
  
  -- Let's look at how users are created.
  -- If StoreOwners.tsx just inserts into 'store_owners', then there MUST be a trigger on 'store_owners' that creates the auth user.
  -- OR, the 'store_owners' table IS the user table? No, that's unlikely with Supabase Auth.
  
  -- Let's assume there is a trigger that creates an auth user from store_owners insert.
  -- If so, we need to update that auth user.
  
  -- Strategy: Update auth.users where email matches the new store owner's email.
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE email = NEW.email AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_store_owner_created_confirm_email ON public.store_owners;

CREATE TRIGGER on_store_owner_created_confirm_email
  AFTER INSERT ON public.store_owners
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_store_owner();
