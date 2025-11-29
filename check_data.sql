-- Check the last 5 orders
SELECT id, created_at, store_id, total_price 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
