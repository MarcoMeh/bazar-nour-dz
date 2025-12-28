import sys
import os
from PyQt5.QtWidgets import QWidget, QMessageBox
from PyQt5.uic import loadUi
from PyQt5.QtCore import pyqtSignal, Qt
from PyQt5.QtGui import QPixmap
from db import db

class ArtifactDetailsWindow(QWidget):
    goBack = pyqtSignal()
    goEdit = pyqtSignal(int)

    def __init__(self, artifact_id):
        super().__init__()
        try:
            loadUi("artifact_details.ui", self)
        except Exception as e:
            print(f"Error loading UI: {e}")
            return

        self.artifact_id = artifact_id
        self.images = []
        self.current_img_idx = 0

        self.load_data()
        self.load_images()

        # Connections
        self.btnBack.clicked.connect(self.goBack.emit)
        self.btnNext.clicked.connect(self.next_image)
        self.btnPrev.clicked.connect(self.prev_image)
        self.btnDelete.clicked.connect(self.delete_artifact)
        self.btnEdit.clicked.connect(lambda: self.goEdit.emit(self.artifact_id))

    def load_data(self):
        data = db.get_artifact(self.artifact_id)
        if data:
            # تعبئة الحقول الأساسية
            self.valInventory.setText(data['inventory_number'])
            self.valCode.setText(str(data.get('code', '---')))
            self.valName.setText(data['name'])
            self.valSource.setText(data['source'])
            self.valType.setText(data['type'])
            self.valMaterial.setText(data['material'])
            
            # القياسات والوزن
            self.valDimensions.setText(data['dims'])
            self.valWeight.setText(data['weight'])

            self.valPeriod.setText(data['period'])
            self.valCondition.setText(data['condition'])
            
            # الموقع
            storage_text = f"{data['storage']}"
            if data['storage_row']: storage_text += f" - الصف: {data['storage_row']}"
            if data['storage_col']: storage_text += f" - العمود: {data['storage_col']}"
            self.valStorage.setText(storage_text)

            self.valDescription.setText(data['description'])
            self.valNotes.setText(data['notes'])
            
            # ✅ الحقول الجديدة: المحرر والتاريخ
            self.valEditor.setText(data.get('card_editor', '---'))
            self.valEditDate.setText(data.get('editing_date', '---'))

    def load_images(self):
        self.images = db.get_artifact_images(self.artifact_id)
        if self.images:
            self.current_img_idx = 0
            self.show_image()
        else:
            self.lblImage.setText("لا توجد صور")
            self.lblImageCounter.setText("0 / 0")

    def show_image(self):
        if not self.images: return
        
        img_data = self.images[self.current_img_idx]
        img_path = os.path.join("artifact_images", img_data['image_path'])
        
        if os.path.exists(img_path):
            pixmap = QPixmap(img_path)
            self.lblImage.setPixmap(pixmap.scaled(
                self.lblImage.size(), Qt.KeepAspectRatio, Qt.SmoothTransformation
            ))
        else:
            self.lblImage.setText("ملف الصورة غير موجود")
            
        self.lblImageCounter.setText(f"{self.current_img_idx + 1} / {len(self.images)}")

    def next_image(self):
        if self.images:
            self.current_img_idx = (self.current_img_idx + 1) % len(self.images)
            self.show_image()

    def prev_image(self):
        if self.images:
            self.current_img_idx = (self.current_img_idx - 1) % len(self.images)
            self.show_image()

    def delete_artifact(self):
        reply = QMessageBox.question(self, "حذف", "هل أنت متأكد من حذف هذه القطعة نهائياً؟", QMessageBox.Yes | QMessageBox.No)
        if reply == QMessageBox.Yes:
            if db.delete_artifact(self.artifact_id):
                QMessageBox.information(self, "نجاح", "تم الحذف بنجاح")
                self.goBack.emit()
            else:
                QMessageBox.warning(self, "خطأ", "فشل الحذف")
