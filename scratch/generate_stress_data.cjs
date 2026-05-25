const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '..', 'src', 'config', 'stress_test_data.json');

// Generate 100 stores
const stores = [];
const storeIds = [];

const statuses = ['active', 'expired', 'suspended'];
const themes = ['default', 'dark', 'glass'];

for (let i = 1; i <= 100; i++) {
    const id = `store-uuid-mock-${i.toString().padStart(4, '0')}`;
    storeIds.push(id);
    
    // Distribute subscription states
    const status = statuses[i % 3]; // active, expired, suspended
    const isActive = status === 'active';
    const isSuspended = status === 'suspended';
    
    // Subscription end date calculation
    let subEndDate = new Date();
    if (status === 'active') {
        subEndDate.setDate(subEndDate.getDate() + 30); // 30 days in future
    } else if (status === 'expired') {
        subEndDate.setDate(subEndDate.getDate() - 5); // 5 days in past
    } else {
        subEndDate.setDate(subEndDate.getDate() + 10); // Active but suspended manually
    }

    stores.push({
        id,
        name: `متجر النخبة الممتاز ${i}`,
        slug: `store-elite-${i}`,
        description: `هذا هو الوصف التجريبي للمتجر رقم ${i} المتخصص في بيع المنتجات الاستهلاكية والملابس ذات الجودة العالية في الجزائر.`,
        image_url: `https://picsum.photos/200/200?random=${i}`,
        cover_image_url: `https://picsum.photos/800/300?random=${i}`,
        is_active: isActive,
        is_manually_suspended: isSuspended,
        subscription_end_date: subEndDate.toISOString(),
        theme_id: themes[i % 3],
        primary_color: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#3b82f6" : "#f59e0b",
        phone_numbers: [`05500000${i.toString().padStart(2, '0')}`],
        whatsapp: `2135500000${i.toString().padStart(2, '0')}`,
        facebook: `https://facebook.com/store${i}`,
        instagram: `https://instagram.com/store${i}`,
        tiktok: `https://tiktok.com/@store${i}`,
        created_at: new Date(Date.now() - i * 3600000).toISOString()
    });
}

// Generate 1500 products
const products = [];
const categories = ['ملابس', 'إلكترونيات', 'ديكور ومستلزمات منزلية', 'عطور وتجميل'];
const categoryIds = [
    'cat-uuid-mock-0001', // clothing
    'cat-uuid-mock-0002', // electronics
    'cat-uuid-mock-0003', // decoration
    'cat-uuid-mock-0004'  // beauty
];

for (let i = 1; i <= 1500; i++) {
    const id = `product-uuid-mock-${i.toString().padStart(4, '0')}`;
    const storeIdx = i % 100;
    const catIdx = i % 4;
    const price = Math.floor(Math.random() * 8500) + 450; // Random price between 450 and 8950 DZD

    products.push({
        id,
        store_id: storeIds[storeIdx],
        category_id: categoryIds[catIdx],
        name: `Stress Test Product ${i}`,
        name_ar: `منتج تجريبي فائق الجودة رقم ${i}`,
        price,
        description: `This is a high quality test product number ${i} generated for frontend stress and performance profiling.`,
        description_ar: `هذا المنتج عبارة عن نموذج اختبار أداء رقم ${i} تم توليده خصيصاً للتأكد من قدرة المنصة على تحمل البيانات الكبيرة ورندرتها في الهاتف بسلاسة.`,
        image_url: `https://picsum.photos/400/400?random=${i}`,
        images: [
            `https://picsum.photos/400/400?random=${i + 10000}`,
            `https://picsum.photos/400/400?random=${i + 20000}`
        ],
        created_at: new Date(Date.now() - i * 600000).toISOString(),
        updated_at: new Date().toISOString(),
        categories: {
            name: categories[catIdx]
        }
    });
}

const data = {
    stores,
    products
};

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`✅ Stress test data generated successfully at: ${targetPath}`);
console.log(`   - Generated ${stores.length} mock stores.`);
console.log(`   - Generated ${products.length} mock products.`);
