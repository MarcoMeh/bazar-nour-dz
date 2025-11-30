-- 1. List all users and their roles to see current status
SELECT 
    au.email, 
    p.role, 
    p.id IS NOT NULL as profile_exists
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- 2. If you see your email but the role is NOT 'admin', run the following command:
-- (Uncomment the line below and replace 'your_email@example.com' with your email)

-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your_email@example.com');
