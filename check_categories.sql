-- Check for root categories
SELECT count(*) as root_categories_count FROM categories WHERE parent_id IS NULL;

-- Check total categories
SELECT count(*) as total_categories_count FROM categories;

-- List first 5 root categories
SELECT id, name, name_ar, parent_id FROM categories WHERE parent_id IS NULL LIMIT 5;
