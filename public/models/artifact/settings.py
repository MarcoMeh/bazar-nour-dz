import sys
from PyQt5.QtWidgets import QWidget, QMessageBox, QListWidgetItem
from PyQt5.uic import loadUi
from PyQt5.QtCore import pyqtSignal, Qt
from db import db

class SettingsWindow(QWidget):


    def __init__(self):
        super().__init__()
        try:
            loadUi("settings.ui", self)
        except Exception as e:
            print(f"Error loading UI: {e}")
            return

        # خريطة لربط الاسم العربي باسم الجدول في قاعدة البيانات
        self.tables_map = {
            "أنواع القطع": "artifact_types",
            "مواد الصنع": "materials",
            "الفترات التاريخية": "historical_periods",
            "حالات الحفظ": "preservation_states",
            "طرق الترميم": "restoration_methods",
            "أماكن التخزين": "storage_locations"
        }

        # ملء القائمة المنسدلة
        self.comboTables.addItems(self.tables_map.keys())
        # تحميل البيانات عند البدء وعند تغيير الاختيار
        self.load_current_list()
        self.comboTables.currentIndexChanged.connect(self.load_current_list)

        # ربط الأزرار
        self.btnAdd.clicked.connect(self.add_item)
        self.btnDelete.clicked.connect(self.delete_item)
        

    def get_current_table(self):
        """معرفة اسم الجدول الإنجليزي من الاختيار العربي"""
        arabic_name = self.comboTables.currentText()
        return self.tables_map.get(arabic_name)

    def load_current_list(self):
        """تحميل العناصر في القائمة"""
        self.listItems.clear()
        table_name = self.get_current_table()
        
        if not table_name: return

        items = db.get_list(table_name)
        for item in items:
            # نخزن الـ ID داخل العنصر لنستخدمه عند الحذف
            list_item = QListWidgetItem(item['name'])
            list_item.setData(Qt.UserRole, item['id']) 
            self.listItems.addItem(list_item)

    def add_item(self):
        text = self.inputNewItem.text().strip()
        if not text: return

        table_name = self.get_current_table()
        if db.insert_lookup(table_name, text):
            self.inputNewItem.clear()
            self.load_current_list() # تحديث القائمة
        else:
            QMessageBox.warning(self, "خطأ", "حدث خطأ أثناء الإضافة")

    def delete_item(self):
        current_item = self.listItems.currentItem()
        if not current_item:
            QMessageBox.warning(self, "تنبيه", "الرجاء تحديد عنصر للحذف")
            return

        item_id = current_item.data(Qt.UserRole)
        item_name = current_item.text()
        table_name = self.get_current_table()

        reply = QMessageBox.question(self, "تأكيد", f"هل تريد حذف '{item_name}'؟\nتنبيه: قد يؤثر هذا على القطع المرتبطة به.",
                                   QMessageBox.Yes | QMessageBox.No)
        
        if reply == QMessageBox.Yes:
            if db.delete_lookup(table_name, item_id):
                self.load_current_list()
            else:
                QMessageBox.warning(self, "خطأ", "لا يمكن حذف هذا العنصر (قد يكون مستخدماً في قطع أثرية)")

    def set_translation(self, t):
        self.pageTitle.setText(t["set_title"])
        self.label1.setText(t["lbl_choose"])
        self.inputNewItem.setPlaceholderText(t["ph_new"])
        self.btnAdd.setText(t["btn_add_item"])
        self.label2.setText(t["lbl_current"])
        self.btnDelete.setText(t["btn_del_item"])
