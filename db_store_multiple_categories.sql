-- ============================================
-- التصنيفات المتعددة للمحلات (Many-to-Many)
-- نسخة نظيفة - تحذف الجدول القديم وتعيد إنشاءه
-- ============================================

-- حذف الجدول القديم إذا كان موجوداً
DROP TABLE IF EXISTS store_categories CASCADE;

-- إنشاء الجدول من جديد
CREATE TABLE store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, category_id)
);

-- Indexes للأداء
CREATE INDEX idx_store_categories_store ON store_categories(store_id);
CREATE INDEX idx_store_categories_category ON store_categories(category_id);

-- تفعيل RLS
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالعرض
DROP POLICY IF EXISTS "Anyone can view store categories" ON store_categories;
CREATE POLICY "Anyone can view store categories"
  ON store_categories
  FOR SELECT
  TO public
  USING (true);

-- السماح للمستخدمين المصادقين بالإدارة
DROP POLICY IF EXISTS "Manage store categories" ON store_categories;
CREATE POLICY "Manage store categories"
  ON store_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- تعليقات
COMMENT ON TABLE store_categories IS 'ربط المحلات بالتصنيفات (many-to-many) - يسمح لمحل واحد أن يكون في عدة تصنيفات';
COMMENT ON COLUMN store_categories.store_id IS 'معرف المحل من جدول stores';
COMMENT ON COLUMN store_categories.category_id IS 'معرف التصنيف من جدول categories';

-- رسالة نجاح
SELECT 'تم إنشاء جدول store_categories بنجاح!' as message;
