import sqlite3
import bcrypt
import os

def reset_admin_user():
    db_file = "heritage.db"
    
    # 1. التأكد من وجود ملف قاعدة البيانات
    if not os.path.exists(db_file):
        print("⚠️ ملف قاعدة البيانات غير موجود. يرجى تشغيل main.py مرة واحدة لإنشائه.")
        return

    try:
        conn = sqlite3.connect(db_file)
        cur = conn.cursor()

        # 2. حذف الأدمن القديم (لضمان عدم التكرار)
        cur.execute("DELETE FROM users WHERE username = 'admin'")
        
        # 3. إعداد البيانات الجديدة
        username = "admin"
        password_raw = "admin"  # 👈 كلمة المرور التي تريدها
        
        # تشفير كلمة المرور
        hashed = bcrypt.hashpw(password_raw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # 4. إضافة المستخدم
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", 
                    (username, hashed, "admin"))
        
        conn.commit()
        print("✅ تم إنشاء المستخدم بنجاح!")
        print(f"👤 المستخدم: {username}")
        print(f"🔑 كلمة المرور: {password_raw}")
        print("------------------------------------------------")
        
        # 5. التحقق من الإضافة
        cur.execute("SELECT id, username, role FROM users WHERE username = 'admin'")
        user = cur.fetchone()
        if user:
            print(f"تأكيد من القاعدة: المستخدم {user[1]} موجود بصلاحية {user[2]}")
        
    except Exception as e:
        print(f"❌ حدث خطأ: {e}")
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    reset_admin_user()
