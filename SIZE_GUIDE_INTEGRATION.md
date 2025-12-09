# دمج دليل المقاسات مع صفحة المنتج

## 📝 الخطوات المطلوبة:

### 1. في ProductDetail.tsx - أضف زر دليل المقاسات

في قسم Size Selection (حوالي السطر 338-356)، ابحث عن:
```tsx
{/* Size Selection */}
{product.sizes && product.sizes.length > 0 && (
  <div className="mb-6">
    <h3 className="font-semibold mb-3">المقاس:</h3>
```

**استبدله بـ:**
```tsx
{/* Size Selection */}
{product.sizes && product.sizes.length > 0 && (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold">المقاس:</h3>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSizeGuideOpen(true)}
        className="text-primary hover:text-primary/80 gap-2"
      >
        <Ruler className="h-4 w-4" />
        دليل المقاسات
      </Button>
    </div>
```

### 2. إضافة المودال قبل نهاية return

في نهاية الملف (قبل `</div>` الأخير )، أضف:
```tsx
{/* Size Guide Modal */}
<SizeGuideModal 
  open={sizeGuideOpen} 
  onOpenChange={setSizeGuideOpen}
  category="mens" 
/>
```

### 3. ✅ تم بالفعل:
- Import SizeGuideModal ✓
- Import Ruler icon ✓  
- State للمودال ✓

---

## 🎨 النتيجة المتوقعة:

عند فتح صفحة منتج:
1. يظهر زر **"دليل المقاسات"** بجانب "المقاس:"
2. عند الضغط عليه، ينفتح مودال كامل
3. يحتوي على 4 تبويبات (رجالي، نسائي، أطفال، أحذية)
4. جداول شاملة لكل الم قاسات
5. نصائح القياس وإرشادات

---

## 🔧 تحسينات إضافية (اختيارية):

### إضافة نصيحة تحت buttons المقاسات:
```tsx
{!selectedSize && (
  <p className="text-sm text-muted-foreground mt-2">
    💡 اختر المقاس المناسب - طالع دليل المقاسات للمزيد من المعلومات
  </p>
)}
```

### تحديد Category تلقائياً حسب المنتج:
```tsx
// في بداية Component
const getSizeCategory = () => {
  // يمكن الحصول على النوع من category_id
  if (product.category_id === 'mens-clothing') return 'mens';
  if (product.category_id === 'womens-clothing') return 'womens';
  if (product.category_id === 'kids-clothing') return 'kids';
  if (product.category_id === 'shoes') return 'shoes';
  return 'mens'; // default
};

// في المودال
<SizeGuideModal 
  open={sizeGuideOpen} 
  onOpenChange={setSizeGuideOpen}
  category={getSizeCategory()} 
/>
```

---

هل تريد أن أقوم بالتعديل اليدوي مباشرة؟
