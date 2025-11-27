-- 1. Create a Trigger to automatically create a profile when a new user signs up
-- This ensures the profile exists before we try to link a store to it.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Add RLS Policies for Profiles to allow Admins to manage them
-- We use a security definer function to avoid infinite recursion when checking admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow Admins to do everything on profiles
CREATE POLICY "Admins can do everything on profiles"
  ON public.profiles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow Users to insert their own profile (fallback if trigger fails or for manual inserts)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Ensure Storage Policies are correct (just in case)
-- Allow public read access to store-images
CREATE POLICY "Public Access Store Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'store-images' );

-- Allow authenticated users to upload to store-images
CREATE POLICY "Authenticated users can upload store images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'store-images' AND auth.role() = 'authenticated' );
