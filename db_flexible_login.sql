-- ============================================
-- Flexible Login Helper Function
-- Allows login via Store Name or Phone Number
-- ============================================

-- Function to look up email by identifier (Store Name or Phone)
CREATE OR REPLACE FUNCTION get_login_email(identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to bypass RLS for lookup
AS $$
DECLARE
  found_email text;
BEGIN
  -- 1. Check Stores (Get Owner Email by Store Name)
  SELECT p.email INTO found_email
  FROM stores s
  JOIN profiles p ON s.owner_id = p.id
  WHERE s.name = identifier
  LIMIT 1;

  IF found_email IS NOT NULL THEN
    RETURN found_email;
  END IF;

  -- 2. Check Profiles (Get Email by Phone)
  SELECT email INTO found_email
  FROM profiles
  WHERE phone = identifier
  LIMIT 1;

  RETURN found_email;
END;
$$;

-- Grant execute permission to public (anonymous users need to call this to login)
GRANT EXECUTE ON FUNCTION get_login_email(text) TO public;
GRANT EXECUTE ON FUNCTION get_login_email(text) TO anon;
GRANT EXECUTE ON FUNCTION get_login_email(text) TO authenticated;

COMMENT ON FUNCTION get_login_email IS 'Returns the email associated with a Store Name or Phone Number for login purposes';

SELECT 'Function get_login_email created successfully' as message;
