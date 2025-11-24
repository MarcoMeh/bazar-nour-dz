-- FIX AUTH API PERMISSIONS
-- The manual update worked, so the database is fine.
-- The issue is that the "supabase_auth_admin" role (used by the API) is blocked.

-- 1. Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin, service_role, postgres;

-- 2. Grant ALL privileges on auth.users to the auth admin
GRANT ALL ON TABLE auth.users TO supabase_auth_admin, service_role, postgres;

-- 3. Grant ALL privileges on sequences (for IDs)
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin, service_role, postgres;

-- 4. Grant execute on functions (like crypt, gen_salt)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin, service_role, postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO supabase_auth_admin, service_role, postgres;

-- 5. Ensure public schema is accessible
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, service_role, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin, service_role, postgres;

SELECT 'Permissions granted to Auth Admin. Try logging in now.' as status;
