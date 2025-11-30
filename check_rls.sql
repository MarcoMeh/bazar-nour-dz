-- Check RLS policies for relevant tables
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename IN ('orders', 'order_items', 'products', 'stores', 'profiles');

-- Check if RLS is enabled on these tables
SELECT
    relname,
    relrowsecurity
FROM
    pg_class
WHERE
    relname IN ('orders', 'order_items', 'products', 'stores', 'profiles');
