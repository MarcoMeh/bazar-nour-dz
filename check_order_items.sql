-- Check table definition
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'order_items';

-- Check recent order items
SELECT * FROM order_items ORDER BY created_at DESC LIMIT 5;
