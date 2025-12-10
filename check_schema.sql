-- ============================================
-- ملف التحقق من Schema الموجود
-- ============================================
-- قم بتشغيل هذه الاستعلامات واحدة تلو الأخرى للتحقق

-- 1. التحقق من وجود جدول stores
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'stores'
);

-- 2. عرض جميع أعمدة جدول stores
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'stores'
ORDER BY ordinal_position;

-- 3. التحقق من وجود جدول categories
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'categories'
);

-- 4. عرض جميع أعمدة جدول categories
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'categories'
ORDER BY ordinal_position;

-- 5. عرض جميع الجداول في قاعدة البيانات
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
