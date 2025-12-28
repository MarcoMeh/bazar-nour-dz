from PyQt6.QtWidgets import QWidget, QPushButton, QMessageBox
from db import db
from ui_artifacts_page import Ui_ArtifactsPage

class ArtifactsPage(QWidget):
    def __init__(self):
        super().__init__()
        self.ui = Ui_ArtifactsPage()
        self.ui.setupUi(self)

        self.load_artifacts()

        self.ui.searchBox.textChanged.connect(self.search)
        self.ui.btnAddArtifact.clicked.connect(self.add_artifact_window)

    def load_artifacts(self):
        rows = db.fetch_all("""
            SELECT id, name, type_id, quantity, material_id,
                   period_id, condition_id
            FROM artifacts
            ORDER BY id DESC
        """)

        table = self.ui.tableArtifacts
        table.setRowCount(0)

        for row_data in rows:
            row = table.rowCount()
            table.insertRow(row)

            for col, value in enumerate(row_data):
                table.setItem(row, col, QTableWidgetItem(str(value)))

            # أزرار الإجراءات
            btnEdit = QPushButton("تعديل")
            btnDelete = QPushButton("حذف")
            btnView = QPushButton("عرض")

            btnEdit.clicked.connect(lambda _, r=row_data[0]: self.edit_artifact(r))
            btnDelete.clicked.connect(lambda _, r=row_data[0]: self.delete_artifact(r))
            btnView.clicked.connect(lambda _, r=row_data[0]: self.view_artifact(r))

            table.setCellWidget(row, 7, self.build_actions(btnEdit, btnDelete, btnView))

    def build_actions(self, *buttons):
        w = QWidget()
        layout = QHBoxLayout()
        for b in buttons:
            layout.addWidget(b)
        layout.setContentsMargins(0, 0, 0, 0)
        w.setLayout(layout)
        return w

    def search(self):
        text = self.ui.searchBox.text()
        # سنضيف منطق البحث لاحقًا إذا أردت

    def add_artifact_window(self):
        from add_artifact import AddArtifactWindow
        self.addWin = AddArtifactWindow()
        self.addWin.show()

    def edit_artifact(self, artifact_id):
        from edit_artifact import EditArtifactWindow
        self.editWin = EditArtifactWindow(artifact_id)
        self.editWin.show()

    def delete_artifact(self, artifact_id):
        confirm = QMessageBox.question(self, "تأكيد", "هل أنت متأكد من حذف القطعة؟")
        if confirm == QMessageBox.StandardButton.Yes:
            db.execute("DELETE FROM artifacts WHERE id = %s", (artifact_id,))
            self.load_artifacts()

    def view_artifact(self, artifact_id):
        from view_artifact import ArtifactViewWindow
        self.viewWin = ArtifactViewWindow(artifact_id)
        self.viewWin.show()
