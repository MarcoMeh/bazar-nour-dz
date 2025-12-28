import sys
import os
import shutil
from PyQt5.QtWidgets import QWidget, QFileDialog, QMessageBox, QListWidgetItem
from PyQt5.uic import loadUi
from PyQt5.QtCore import pyqtSignal, QDate, Qt
from db import db

class EditArtifactWindow(QWidget):
    goDetails = pyqtSignal(int) 

    def __init__(self, artifact_id):
        super().__init__()
        try:
            loadUi("edit_artifact.ui", self)
        except Exception as e:
            print(f"Error loading UI: {e}")
            return
            
        self.artifact_id = artifact_id
        self.new_images = [] 
        self.deleted_images_ids = []

        self.load_combos()
        self.load_artifact_data()

        self.btnAddImages.clicked.connect(self.pick_images)
        self.btnRemoveImage.clicked.connect(self.remove_selected_image)
        self.btnSave.clicked.connect(self.save_changes)
        self.btnCancel.clicked.connect(lambda: self.goDetails.emit(self.artifact_id))

    def set_translation(self, t):
        self.pageTitle.setText(t["edit_title"])
        
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
        self.btnRemoveImage.setText(t["btn_remove_img"])
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

    def load_artifact_data(self):
        data = db.get_artifact_for_edit(self.artifact_id)
        if not data: return

        # Text Fields
        self.inputInventoryNo.setText(data.get('inventory_number', ''))
        self.inputName.setText(data.get('name', ''))
        self.inputSource.setText(data.get('source', ''))
        self.spinQuantity.setValue(data.get('quantity', 1))
        
        self.inputStorageRow.setText(data.get('storage_row', ''))
        self.inputStorageCol.setText(data.get('storage_col', ''))
        self.inputEditor.setText(data.get('card_editor', ''))

        # Numbers
        self.spinLength.setValue(data.get('dim_length', 0))
        self.spinWidth.setValue(data.get('dim_width', 0))
        self.spinDiameter.setValue(data.get('dim_diameter', 0))
        self.spinThickness.setValue(data.get('dim_thickness', 0))
        self.spinWeight.setValue(data.get('weight', 0))
        self.comboWeightUnit.setCurrentText(data.get('weight_unit', 'g'))

        # Text Areas
        self.inputDescription.setText(data.get('description', ''))
        self.inputNotes.setText(data.get('notes', ''))

        # Combos
        self.set_combo(self.comboType, data['artifact_type_id'])
        self.set_combo(self.comboMaterial, data['material_id'])
        self.set_combo(self.comboPeriod, data['historical_period_id'])
        self.set_combo(self.comboCondition, data['preservation_state_id'])
        self.set_combo(self.comboStorage, data['storage_location_id'])
        
        # Dates
        if data.get('restoration_date'):
            self.dateRetrieval.setDate(QDate.fromString(str(data['restoration_date']), "yyyy-MM-dd"))
        if data.get('editing_date'):
            self.dateEditing.setDate(QDate.fromString(str(data['editing_date']), "yyyy-MM-dd"))
        else:
            self.dateEditing.setDate(QDate.currentDate()) # تحديث تاريخ التحرير لليوم

        self.load_images_list()

    def set_combo(self, combo, value_id):
        if value_id:
            for i in range(combo.count()):
                if combo.itemData(i) == value_id:
                    combo.setCurrentIndex(i)
                    return

    def load_images_list(self):
        self.imagesList.clear()
        old_imgs = db.get_artifact_images(self.artifact_id)
        for img in old_imgs:
            if img['id'] not in self.deleted_images_ids:
                item = QListWidgetItem(f"📁 {img['image_path']}")
                item.setData(Qt.UserRole, {"type": "old", "id": img['id']})
                self.imagesList.addItem(item)

        for path in self.new_images:
            item = QListWidgetItem(f"🆕 {os.path.basename(path)}")
            item.setData(Qt.UserRole, {"type": "new", "path": path})
            self.imagesList.addItem(item)

    def pick_images(self):
        files, _ = QFileDialog.getOpenFileNames(self, "Images", "", "*.png *.jpg *.jpeg")
        if files:
            for f in files:
                if f not in self.new_images:
                    self.new_images.append(f)
            self.load_images_list()

    def remove_selected_image(self):
        row = self.imagesList.currentRow()
        if row < 0: return
        item = self.imagesList.item(row)
        data = item.data(Qt.UserRole)
        
        if data['type'] == 'old':
            self.deleted_images_ids.append(data['id'])
        else:
            self.new_images.remove(data['path'])
        self.load_images_list()

    def save_changes(self):
        name = self.inputName.text().strip()
        if not name: return

        data = {
            "id": self.artifact_id,
            "name": name,
            "inventory_number": self.inputInventoryNo.text().strip(),
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
            "card_editor": self.inputEditor.text().strip(),
            "editing_date": self.dateEditing.date().toString("yyyy-MM-dd"),
            
            "restoration_method_id": None 
        }

        if db.update_artifact(data):
            for img_id in self.deleted_images_ids:
                db.delete_image(img_id)

            folder = "artifact_images"
            if not os.path.exists(folder): os.makedirs(folder)
            
            for img_path in self.new_images:
                safe_inv = data['inventory_number'].replace("/", "-")
                filename = f"{self.artifact_id}_{safe_inv}_{os.path.basename(img_path)}"
                dest = os.path.join(folder, filename)
                try:
                    shutil.copy(img_path, dest)
                    db.insert_image(self.artifact_id, filename)
                except: pass
            
            # تحديث صامت وعودة
            self.goDetails.emit(self.artifact_id)
        else:
            QMessageBox.warning(self, "خطأ", "فشل التحديث")
