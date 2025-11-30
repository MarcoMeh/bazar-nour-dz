-- Check columns of the stores table specifically
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'stores';
