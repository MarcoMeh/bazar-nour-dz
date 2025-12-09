-- ============================================
-- إعادة هيكلة التصنيفات لمنصة الأزياء "بازارنا"
-- ============================================

-- ملاحظة: يمكنك حذف التصنيفات القديمة أو الاحتفاظ بها
-- لحذفها، قم بإزالة التعليق من السطور التالية:

-- DELETE FROM subcategories;
-- DELETE FROM categories;

-- ============================================
-- 1. التصنيفات الرئيسية (Main Categories)
-- ============================================

INSERT INTO categories (name, slug, image_url) VALUES
('ملابس رجالية', 'mens-clothing', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400'),
('ملابس نسائية', 'womens-clothing', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400'),
('ملابس أطفال', 'kids-clothing', 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400'),
('ملابس داخلية', 'underwear', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400'),
('أحذية', 'shoes', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400'),
('إكسسوارات', 'accessories', 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;

-- ============================================
-- 2. التصنيفات الفرعية (Subcategories)
-- ============================================

-- الحصول على IDs للتصنيفات الرئيسية
DO $$
DECLARE
    mens_id UUID;
    womens_id UUID;
    kids_id UUID;
    underwear_id UUID;
    shoes_id UUID;
    accessories_id UUID;
BEGIN
    -- الحصول على IDs
    SELECT id INTO mens_id FROM categories WHERE slug = 'mens-clothing';
    SELECT id INTO womens_id FROM categories WHERE slug = 'womens-clothing';
    SELECT id INTO kids_id FROM categories WHERE slug = 'kids-clothing';
    SELECT id INTO underwear_id FROM categories WHERE slug = 'underwear';
    SELECT id INTO shoes_id FROM categories WHERE slug = 'shoes';
    SELECT id INTO accessories_id FROM categories WHERE slug = 'accessories';

    -- ============================================
    -- 2.1 ملابس رجالية - التصنيفات الفرعية
    -- ============================================
    INSERT INTO subcategories (name, slug, category_id) VALUES
    ('قمصان وتيشيرتات', 'mens-shirts-tshirts', mens_id),
    ('بناطيل وجينز', 'mens-pants-jeans', mens_id),
    ('سترات ومعاطف', 'mens-jackets-coats', mens_id),
    ('ملابس رياضية', 'mens-sportswear', mens_id),
    ('ملابس تقليدية', 'mens-traditional', mens_id)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

    -- ============================================
    -- 2.2 ملابس نسائية - التصنيفات الفرعية
    -- ============================================
    INSERT INTO subcategories (name, slug, category_id) VALUES
    ('فساتين وعبايات', 'womens-dresses-abayas', womens_id),
    ('بلوزات وقمصان', 'womens-blouses-shirts', womens_id),
    ('بناطيل وتنانير', 'womens-pants-skirts', womens_id),
    ('ملابس محجبات', 'womens-hijab', womens_id),
    ('ملابس تقليدية', 'womens-traditional', womens_id)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

    -- ============================================
    -- 2.3 ملابس أطفال - التصنيفات الفرعية
    -- ============================================
    INSERT INTO subcategories (name, slug, category_id) VALUES
    ('مواليد (0-2 سنة)', 'kids-babies', kids_id),
    ('أطفال بنات', 'kids-girls', kids_id),
    ('أطفال أولاد', 'kids-boys', kids_id)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

    -- ============================================
    -- 2.4 ملابس داخلية - التصنيفات الفرعية
    -- ============================================
    INSERT INTO subcategories (name, slug, category_id) VALUES
    ('ملابس داخلية نسائية', 'underwear-women', underwear_id),
    ('ملابس داخلية رجالية', 'underwear-men', underwear_id)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

    -- ============================================
    -- 2.5 أحذية - التصنيفات الفرعية
    -- ============================================
    INSERT INTO subcategories (name, slug, category_id) VALUES
    ('أحذية رجالية', 'shoes-men', shoes_id),
    ('أحذية نسائية', 'shoes-women', shoes_id),
    ('أحذية أطفال', 'shoes-kids', shoes_id),
    ('أحذية رياضية', 'shoes-sports', shoes_id)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

    -- ============================================
    -- 2.6 إكسسوارات - التصنيفات الفرعية
    -- ============================================
    INSERT INTO subcategories (name, slug, category_id) VALUES
    ('حقائب', 'accessories-bags', accessories_id),
    ('أحزمة', 'accessories-belts', accessories_id),
    ('حُلي ومجوهرات', 'accessories-jewelry', accessories_id),
    ('ساعات', 'accessories-watches', accessories_id),
    ('نظارات', 'accessories-sunglasses', accessories_id)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

END $$;

-- ============================================
-- تأكيد النجاح
-- ============================================
SELECT 
    'تم تحديث التصنيفات بنجاح!' as message,
    COUNT(*) as total_categories 
FROM categories;

SELECT 
    'تم إضافة التصنيفات الفرعية بنجاح!' as message,
    COUNT(*) as total_subcategories 
FROM subcategories;
