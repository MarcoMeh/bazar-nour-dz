import sys
import os
import bcrypt
# 1. أضفنا QDesktopWidget هنا
from PyQt5.QtWidgets import QWidget, QApplication, QVBoxLayout, QLabel, QGraphicsDropShadowEffect, QSizePolicy, QDesktopWidget
from PyQt5.uic import loadUi
from PyQt5.QtCore import pyqtSignal, Qt
from PyQt5.QtGui import QPixmap, QColor
from db import db

class Session:
    username = None
    role = None

class LoginWindow(QWidget):
    loginSuccess = pyqtSignal()

    def __init__(self):
        super().__init__()
        try:
            loadUi("login.ui", self)
        except Exception as e:
            print(f"Error loading UI: {e}")
            return
        
        # ضبط حجم النافذة
        self.resize(1000, 700)
        
        # -----------------------------------------------------
        # 🔥 السحر هنا: كود توسيط النافذة في منتصف الشاشة 🔥
        # -----------------------------------------------------
        self.center_window()
        # -----------------------------------------------------

        # 1. ضبط نسب التقسيم (70% صورة - 30% نموذج)
        if hasattr(self, "horizontalLayout"):
            self.horizontalLayout.setStretch(0, 7) 
            self.horizontalLayout.setStretch(1, 3)

        # 2. وضع الصورة وإصلاح مشكلة الحجم الكبير
        current_dir = os.path.dirname(os.path.abspath(__file__))
        img_path = os.path.join(current_dir, "login_bg.jpeg") 
        
        if hasattr(self, "imagePanel"):
            layout = QVBoxLayout(self.imagePanel)
            layout.setContentsMargins(0, 0, 0, 0)
            
            bg_label = QLabel()
            bg_label.setScaledContents(True) 
            bg_label.setSizePolicy(QSizePolicy.Ignored, QSizePolicy.Ignored)
            
            if os.path.exists(img_path):
                bg_label.setPixmap(QPixmap(img_path))
            else:
                print(f"❌ Image not found at: {img_path}")
                bg_label.setStyleSheet("background-color: #0F4D39; color: white;")
                bg_label.setText("Image Not Found")
                bg_label.setAlignment(Qt.AlignCenter)
            
            layout.addWidget(bg_label)

        # 3. إضافة ظل للزر
        if hasattr(self, "loginBtn"):
            shadow = QGraphicsDropShadowEffect()
            shadow.setBlurRadius(20)
            shadow.setXOffset(0)
            shadow.setYOffset(5)
            shadow.setColor(QColor(15, 77, 57, 80)) 
            self.loginBtn.setGraphicsEffect(shadow)

        # ربط الإشارات
        self.loginBtn.clicked.connect(self.handle_login)
        self.passwordInput.returnPressed.connect(self.handle_login)

    def center_window(self):
        """دالة لحساب منتصف الشاشة ووضع النافذة فيها"""
        # نحصل على هندسة النافذة الحالية
        qr = self.frameGeometry()
        # نحصل على نقطة المنتصف للشاشة
        cp = QDesktopWidget().availableGeometry().center()
        # نحرك مركز مستطيل النافذة إلى منتصف الشاشة
        qr.moveCenter(cp)
        # نحرك النافذة نفسها إلى الزاوية العليا اليسرى للمستطيل الجديد
        self.move(qr.topLeft())

    def handle_login(self):
        username = self.usernameInput.text().strip()
        password = self.passwordInput.text()

        if not username or not password:
            if hasattr(self, "errorLabel"):
                self.errorLabel.setText("الرجاء إدخال البيانات")
                self.errorLabel.setStyleSheet("color: #D32F2F;")
            return

        try:
            user_data = db.fetch_one("SELECT password_hash, role FROM users WHERE username = ?", (username,))
        except Exception as e:
            if hasattr(self, "errorLabel"): self.errorLabel.setText("خطأ في الاتصال")
            print(e)
            return

        if user_data:
            try:
                stored_hash = user_data['password_hash']
                role = user_data['role']
            except:
                stored_hash = user_data[0]
                role = user_data[1]

            if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
                Session.username = username
                Session.role = role
                self.loginSuccess.emit()
                self.close()
            else:
                if hasattr(self, "errorLabel"): self.errorLabel.setText("كلمة المرور غير صحيحة")
                self.passwordInput.clear()
        else:
             if hasattr(self, "errorLabel"): self.errorLabel.setText("المستخدم غير موجود")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    win = LoginWindow()
    win.show()
    sys.exit(app.exec_())
