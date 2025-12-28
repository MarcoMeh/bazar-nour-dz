import sqlite3

conn = sqlite3.connect("heritage.db")
cur = conn.cursor()

try:
    cur.execute("ALTER TABLE artifacts ADD COLUMN card_editor TEXT")
    cur.execute("ALTER TABLE artifacts ADD COLUMN editing_date TEXT")
    conn.commit()
    print("✅ تم إضافة الأعمدة بنجاح!")
except Exception as e:
    print(f"⚠️ ربما الأعمدة موجودة مسبقاً: {e}")

conn.close()
