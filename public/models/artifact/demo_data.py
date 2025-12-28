import sqlite3
import random
from datetime import date, timedelta

def populate_database():
    db_file = "heritage.db"
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()

    print("🔄 جاري تنظيف البيانات القديمة (إن وجدت)...")
    # تنظيف الجداول لضمان عدم التكرار
    tables = ["artifact_images", "artifacts", "artifact_types", "materials", 
              "historical_periods", "preservation_states", "storage_locations", "restoration_methods"]
    for t in tables:
        cur.execute(f"DELETE FROM {t}")
    
    # تصفير العدادات
    cur.execute("DELETE FROM sqlite_sequence") 
    cur.execute("UPDATE sequences SET current_value = 0 WHERE name = 'artifact_code_seq'")

    print("📥 جاري إدخال الثوابت (Lookups)...")

    # 1. أنواع القطع
    types = ["مخطوطة", "سلاح", "آنية فخارية", "عملة نقدية", "تمثال", "مجوهارت", "أدوات زراعية", "نصيجة"]
    for t in types: cur.execute("INSERT INTO artifact_types (name) VALUES (?)", (t,))

    # 2. المواد
    materials = ["ذهب", "فضة", "برونز", "حديد", "خشب", "فخار", "ورق بردي", "جلد", "حجر جيري"]
    for m in materials: cur.execute("INSERT INTO materials (name) VALUES (?)", (m,))

    # 3. الفترات التاريخية
    periods = ["العصر الإسلامي", "العصر العثماني", "العصر الروماني", "العصر البيزنطي", "العصر الحديث", "ما قبل التاريخ"]
    for p in periods: cur.execute("INSERT INTO historical_periods (name) VALUES (?)", (p,))

    # 4. حالات الحفظ
    states = ["ممتازة", "جيدة", "متوسطة", "تحتاج ترميم", "تالفة جزئياً"]
    for s in states: cur.execute("INSERT INTO preservation_states (name) VALUES (?)", (s,))

    # 5. أماكن التخزين
    locations = ["المستودع الرئيسي A", "المستودع الفرعي B", "قاعة العرض 1", "الخزنة الحديدية", "غرفة الأرشيف"]
    for l in locations: cur.execute("INSERT INTO storage_locations (name) VALUES (?)", (l,))

    # 6. طرق الترميم
    methods = ["تنظيف كيميائي", "تنظيف ميكانيكي", "تثبيت أجزاء", "عزل حراري"]
    for m in methods: cur.execute("INSERT INTO restoration_methods (name) VALUES (?)", (m,))

    conn.commit()

    # جلب المعرفات (IDs) لاستخدامها في القطع
    def get_ids(table):
        cur.execute(f"SELECT id FROM {table}")
        return [row[0] for row in cur.fetchall()]

    type_ids = get_ids("artifact_types")
    mat_ids = get_ids("materials")
    per_ids = get_ids("historical_periods")
    state_ids = get_ids("preservation_states")
    loc_ids = get_ids("storage_locations")

    print("🏺 جاري إنشاء 50 قطعة أثرية متنوعة...")

    # أسماء قطع مقترحة لتوليد بيانات واقعية
    prefixes = ["سيف", "درع", "إناء", "جرة", "عملة", "تمثال نصفي", "مخطوطة", "عقد", "خاتم", "فأس"]
    suffixes = ["أثري", "قديم", "نادر", "ملكي", "مزخرف", "صغير", "كبير", "مذهب"]

    for i in range(1, 51):
        # توليد بيانات عشوائية
        name = f"{random.choice(prefixes)} {random.choice(suffixes)}"
        code = str(i).zfill(9)
        inv_num = f"{random.randint(100, 999)}/{random.choice(['أ', 'ب', 'ج', 'د'])}"
        source = random.choice(["تنقيب 2023", "إهداء خاص", "شراء مزاد", "مصادرة", "موقع القلعة"])
        
        # تواريخ عشوائية
        days = random.randint(0, 365 * 5)
        rand_date = date.today() - timedelta(days=days)
        date_str = rand_date.strftime("%Y-%m-%d")

        # قياسات عشوائية
        dim_l = round(random.uniform(5.0, 150.0), 2)
        dim_w = round(random.uniform(2.0, 50.0), 2)
        weight = round(random.uniform(0.1, 20.0), 2)

        sql = """
            INSERT INTO artifacts (
                artifact_code, inventory_number, name, source,
                artifact_type_id, quantity, material_id, 
                historical_period_id, preservation_state_id, 
                restoration_date, storage_location_id, 
                storage_row, storage_col,
                dim_length, dim_width, weight, weight_unit,
                description, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        vals = (
            code, inv_num, name, source,
            random.choice(type_ids),
            random.randint(1, 10),
            random.choice(mat_ids),
            random.choice(per_ids),
            random.choice(state_ids),
            date_str,
            random.choice(loc_ids),
            f"R-{random.randint(1, 10)}",
            f"C-{random.randint(1, 20)}",
            dim_l, dim_w, weight, "kg",
            "قطعة أثرية ذات قيمة تاريخية عالية.",
            "تم الفحص الأولي."
        )
        cur.execute(sql, vals)
        
        # تحديث العداد التسلسلي
        cur.execute("UPDATE sequences SET current_value = ? WHERE name = 'artifact_code_seq'", (i,))

    conn.commit()
    conn.close()
    print("✅ تمت العملية بنجاح! قاعدة البيانات جاهزة.")

if __name__ == "__main__":
    populate_database()
