import sys
import os
import shutil
from PyQt5.QtWidgets import QWidget, QFileDialog, QMessageBox, QListWidgetItem
from PyQt5.uic import loadUi
from PyQt5.QtCore import pyqtSignal, QDate
from db import db

class AddArtifactWindow(QWidget):
    goArtifacts = pyqtSignal()

    def __init__(self):
        super().__init__()
        try:
            loadUi("add_artifact.ui", self)
        except Exception as e:
            print(f"Error loading UI: {e}")
            return
            
        self.selected_images = []
        self.load_combos()
        
        self.dateRetrieval.setDate(QDate.currentDate())
        
        # ✅ التحقق الآمن قبل الاستخدام
        if hasattr(self, "dateEditing"):
            self.dateEditing.setDate(QDate.currentDate())

        # Buttons
        self.btnAddImages.clicked.connect(self.pick_images)
        self.btnSave.clicked.connect(self.save_data)
        self.btnCancel.clicked.connect(self.goArtifacts.emit)

    def set_translation(self, t):
        """تحديث النصوص حسب اللغة"""
        self.pageTitle.setText(t["add_title"])
        
        self.groupBoxBasic.setTitle(t["grp_basic"])
        self.l_inv.setText(t["lbl_inv"])
        self.l1.setText(t["lbl_name"])
        self.l2.setText(t["lbl_type"])
        self.l3.setText(t["lbl_qty"])
        self.l4.setText(t["lbl_mat"])
        self.l_src.setText(t["lbl_src"])

        self.groupBoxDims.setTitle(t["grp_dims"])
        self.l_len.setText(t["lbl_len"])
        self.l_wid.setText(t["lbl_wid"])
        self.l_dia.setText(t["lbl_dia"])
        self.l_thk.setText(t["lbl_thk"])
        self.l_wgt.setText(t["lbl_wgt"])

        self.groupBoxLoc.setTitle(t["grp_loc"])
        self.l_store.setText(t["lbl_store"])
        self.l_row.setText(t["lbl_row"])
        self.l_col.setText(t["lbl_col"])
        self.l5.setText(t["lbl_period"])
        self.l6.setText(t["lbl_cond"])
        self.l7.setText(t["lbl_date"])

        self.groupBoxDetails.setTitle(t["grp_img"])
        self.l9.setText(t["lbl_desc"])
        self.l11.setText(t["lbl_note"])
        self.l10.setText(t["lbl_imgs"])
        
        self.btnAddImages.setText(t["btn_pick"])
        self.btnSave.setText(t["btn_save"])
        self.btnCancel.setText(t["btn_cancel"])

    def load_combos(self):
        self.fill_combo(self.comboType, "artifact_types")
        self.fill_combo(self.comboMaterial, "materials")
        self.fill_combo(self.comboPeriod, "historical_periods")
        self.fill_combo(self.comboCondition, "preservation_states")
        self.fill_combo(self.comboStorage, "storage_locations")

    def fill_combo(self, combo, table):
        combo.clear()
        combo.addItem("---", None)
        for item in db.get_list(table):
            combo.addItem(item['name'], item['id'])

    def pick_images(self):
        files, _ = QFileDialog.getOpenFileNames(self, "Select Images", "", "Images (*.png *.jpg *.jpeg)")
        if files:
            for f in files:
                if f not in self.selected_images:
                    self.selected_images.append(f)
                    self.imagesList.addItem(os.path.basename(f))
            self.lblImagesCount.setText(f"{len(self.selected_images)}")

    def save_data(self):
        name = self.inputName.text().strip()
        inv = self.inputInventoryNo.text().strip()

        if not name or not inv:
            QMessageBox.warning(self, "تنبيه", "الاسم ورقم الجرد مطلوبان")
            return
        
        editor_name = ""
        edit_date = ""
        if hasattr(self, "inputEditor"):
            editor_name = self.inputEditor.text().strip()
        if hasattr(self, "dateEditing"):
            edit_date = self.dateEditing.date().toString("yyyy-MM-dd")

        data = {
            "name": name,
            "inventory_number": inv,
            "source": self.inputSource.text().strip(),
            "type_id": self.comboType.currentData(),
            "quantity": self.spinQuantity.value(),
            "material_id": self.comboMaterial.currentData(),
            "period_id": self.comboPeriod.currentData(),
            "condition_id": self.comboCondition.currentData(),
            "date": self.dateRetrieval.date().toString("yyyy-MM-dd"),
            
            "storage_id": self.comboStorage.currentData(),
            "storage_row": self.inputStorageRow.text().strip(),
            "storage_col": self.inputStorageCol.text().strip(),

            "dim_length": self.spinLength.value(),
            "dim_width": self.spinWidth.value(),
            "dim_diameter": self.spinDiameter.value(),
            "dim_thickness": self.spinThickness.value(),
            "weight": self.spinWeight.value(),
            "weight_unit": self.comboWeightUnit.currentText(),

            "description": self.inputDescription.toPlainText(),
            "notes": self.inputNotes.toPlainText(),
            
            "card_editor": editor_name,
            "editing_date": edit_date
        }

        new_id = db.insert_artifact(data)
        
        if new_id:
            folder = "artifact_images"
            if not os.path.exists(folder): os.makedirs(folder)
            
            for img_path in self.selected_images:
                safe_inv = inv.replace("/", "-").replace("\\", "-")
                filename = f"{new_id}_{safe_inv}_{os.path.basename(img_path)}"
                dest = os.path.join(folder, filename)
                try:
                    shutil.copy(img_path, dest)
                    db.insert_image(new_id, filename)
                except: pass
            
            # حفظ صامت ونقل مباشر
            self.goArtifacts.emit()
        else:
            QMessageBox.critical(self, "خطأ", "فشل الحفظ")
