import sqlite3
import bcrypt
import os

def create_admin():
    db_file = "heritage.db"
    
    # التأكد من وجود قاعدة البيانات
    if not os.path.exists(db_file):
        print("❌ لم يتم العثور على ملف قاعدة البيانات 'heritage.db'")
        print("الرجاء تشغيل البرنامج (main.py) مرة واحدة أولاً لإنشاء الجداول الفارغة.")
        return

    try:
        conn = sqlite3.connect(db_file)
        cur = conn.cursor()

        username = "admin"
        password = "admin05"  # كلمة المرور الافتراضية
        
        # تشفير كلمة المرور
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # التحقق هل المستخدم موجود مسبقاً؟
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cur.fetchone():
            print(f"⚠️ المستخدم '{username}' موجود مسبقاً!")
        else:
            # إضافة الأدمن
            cur.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", 
                        (username, hashed, "admin"))
            conn.commit()
            print(f"✅ تم إنشاء المستخدم بنجاح!")
            print(f"👤 المستخدم: {username}")
            print(f"🔑 كلمة المرور: {password}")

    except Exception as e:
        print(f"❌ حدث خطأ: {e}")
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    create_admin()
