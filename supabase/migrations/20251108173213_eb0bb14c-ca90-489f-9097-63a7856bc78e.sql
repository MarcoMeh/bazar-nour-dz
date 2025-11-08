-- إضافة عمود اسم المورد لجدول المنتجات
ALTER TABLE public.products 
ADD COLUMN supplier_name text;