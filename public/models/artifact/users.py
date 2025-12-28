import sys
import bcrypt
from PyQt5 import QtWidgets
from PyQt5.QtWidgets import QWidget, QTableWidgetItem, QMessageBox
from PyQt5.uic import loadUi
from db import db

class UsersWindow(QWidget):
    def __init__(self):
        super().__init__()
        try:
            loadUi("users.ui", self)
        except Exception as e:
            print(f"Error loading UI: {e}")
            return

        self.load_data()

        # ربط الأزرار
        self.btnAdd.clicked.connect(self.add_user)
        self.btnDelete.clicked.connect(self.delete_user)

    def load_data(self):
        """جلب المستخدمين وعرضهم في الجدول"""
        users = db.get_all_users()
        head = self.tableUsers.horizontalHeader()
        head.setSectionResizeMode(QtWidgets.QHeaderView.Stretch)
        self.tableUsers.setRowCount(len(users))
        self.tableUsers.setColumnWidth(1, 200) # توسيع عمود الاسم

        for i, user in enumerate(users):
            # user = (id, username, role, created_at)
            self.tableUsers.setItem(i, 0, QTableWidgetItem(str(user[0])))
            self.tableUsers.setItem(i, 1, QTableWidgetItem(user[1]))
            self.tableUsers.setItem(i, 2, QTableWidgetItem(user[2]))
            self.tableUsers.setItem(i, 3, QTableWidgetItem(str(user[3])))
        self.tableUsers.setColumnHidden(0, True)
    def add_user(self):
        username = self.inputUser.text().strip()
        password = self.inputPass.text().strip()
        role = self.comboRole.currentText()

        if not username or not password:
            QMessageBox.warning(self, "خطأ", "الرجاء ملء جميع الحقول")
            return

        # تشفير كلمة المرور
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        if db.add_user(username, hashed_pw, role):
            self.inputUser.clear()
            self.inputPass.clear()
            self.load_data() # تحديث الجدول
        else:
            QMessageBox.warning(self, "خطأ", "فشل إضافة المستخدم (ربما الاسم مكرر)")

    def delete_user(self):
        row = self.tableUsers.currentRow()
        if row < 0:
            QMessageBox.warning(self, "تنبيه", "الرجاء تحديد مستخدم للحذف")
            return

        user_id = self.tableUsers.item(row, 0).text()
        username = self.tableUsers.item(row, 1).text()

        if username == "admin":
            QMessageBox.critical(self, "ممنوع", "لا يمكن حذف الأدمن الرئيسي!")
            return

        confirm = QMessageBox.question(self, "حذف", f"هل أنت متأكد من حذف المستخدم {username}؟", QMessageBox.Yes | QMessageBox.No)
        if confirm == QMessageBox.Yes:
            db.delete_user(user_id)
            self.load_data()
    def set_translation(self, t):
        """تحديث نصوص صفحة المستخدمين"""
        self.pageTitle.setText(t["users_title"])
        
        # صندوق الإضافة
        self.groupBox.setTitle(t["grp_new_user"])
        self.label1.setText(t["lbl_username"])
        self.label2.setText(t["lbl_password"])
        self.label3.setText(t["lbl_role"])
        self.btnAdd.setText(t["btn_save_user"])
        
        # زر الحذف
        self.btnDelete.setText(t["btn_del_user"])
        
        # عناوين الجدول
        # (لاحظ: tbl_name موجود مسبقاً في القاموس العام)
        headers = [t["col_id"], t["tbl_name"], t["col_role"], t["col_date"]]
        self.tableUsers.setHorizontalHeaderLabels(headers)
