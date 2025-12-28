import sys
from PyQt5 import QtWidgets
from PyQt5.QtWidgets import QWidget, QTableWidgetItem, QPushButton
from PyQt5.uic import loadUi
from PyQt5.QtCore import pyqtSignal
from db import db

class ArtifactsListWindow(QWidget):
    goDashboard = pyqtSignal()
    goAddArtifact = pyqtSignal()
    goSettings = pyqtSignal()
    goLogout = pyqtSignal()
    goDetails = pyqtSignal(int)

    def __init__(self):
        super().__init__()
        try:
            loadUi("artifacts_list.ui", self)
        except Exception as e:
            print(f"Error loading UI: {e}")
            return

        self.load_data()

        if hasattr(self, "btnAdd"):
            self.btnAdd.clicked.connect(self.goAddArtifact.emit)
            
        if hasattr(self, "btnSearch"):
            self.btnSearch.clicked.connect(self.search)
            
        if hasattr(self, "searchInput"):
            self.searchInput.textChanged.connect(self.search)

    def set_translation(self, t):
        """تحديث النصوص عند تغيير اللغة"""
        if hasattr(self, "pageTitle"): self.pageTitle.setText(t["list_title"])
        if hasattr(self, "searchInput"): self.searchInput.setPlaceholderText(t["search_ph"])
        if hasattr(self, "btnSearch"): self.btnSearch.setText(t["btn_search"])
        if hasattr(self, "btnAdd"): self.btnAdd.setText(t["btn_new"])
        
        # تحديث عناوين الجدول (تأكد من إضافة col_inv و col_store في ملف الترجمة لاحقاً)
        # حالياً سنتركها كما هي في التصميم أو نحدثها يدوياً
        # headers = [t["col_inv"], t["col_code"], t["col_name"], t["col_type"], t["col_material"], t["col_store"], t["col_action"]]
        # self.artifactsTable.setHorizontalHeaderLabels(headers)

    def load_data(self, query=""):
        results = db.search_artifacts(query)
        
        table = self.artifactsTable
        table.setRowCount(0)
        head = table.horizontalHeader()
        head.setSectionResizeMode(QtWidgets.QHeaderView.Stretch)
        # ضبط عرض الأعمدة
        table.setColumnWidth(0, 120) # رقم الجرد
        table.setColumnWidth(1, 120) # الكود
        table.setColumnWidth(2, 250) # الاسم
        table.setColumnWidth(5, 150) # الموقع
        table.setColumnWidth(6, 120) # زر التفاصيل

        for row_idx, item in enumerate(results):
            table.insertRow(row_idx)
            
            # تعبئة الخلايا (لاحظ الترتيب الجديد)
            table.setItem(row_idx, 0, QTableWidgetItem(str(item['id']))) # رقم الجرد
            table.setItem(row_idx, 1, QTableWidgetItem(str(item['inv_num'])))      # الكود الآلي
            table.setItem(row_idx, 2, QTableWidgetItem(item['name']))
            table.setItem(row_idx, 3, QTableWidgetItem(item['type']))
            table.setItem(row_idx, 4, QTableWidgetItem(item['material']))
            table.setItem(row_idx, 5, QTableWidgetItem(item['storage']))      # الموقع
            
            # زر التفاصيل
            btn_details = QPushButton("عرض التفاصيل")
            btn_details.setStyleSheet("""
                QPushButton { background-color: #3498db; color: white; border-radius: 5px; padding: 5px; font-size: 12px; }
                QPushButton:hover { background-color: #2980b9; }
            """)
            
            # نمرر الـ ID الحقيقي للصف لقاعدة البيانات
            real_id = item['real_id'] 
            btn_details.clicked.connect(lambda checked, a_id=real_id: self.goDetails.emit(a_id))
            
            table.setCellWidget(row_idx, 6, btn_details)

    def search(self):
        text = self.searchInput.text().strip()
        self.load_data(text)
