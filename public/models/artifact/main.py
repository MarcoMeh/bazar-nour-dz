import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QWidget, QSizePolicy
from PyQt5.QtCore import Qt
from PyQt5.uic import loadUi
from login import LoginWindow, Session  # Import Session here
import warnings
from translations import translations

warnings.filterwarnings("ignore", category=DeprecationWarning)

from dashboard import DashboardWindow
from artifacts_list import ArtifactsListWindow
from add_artifact import AddArtifactWindow
from settings import SettingsWindow
from artifact_details import ArtifactDetailsWindow
from edit_artifact import EditArtifactWindow

# Global variable for current language
CURRENT_LANG = "ar"

class MainApp(QMainWindow):
    def __init__(self):
        super().__init__()
        try:
            loadUi("main_window.ui", self)
        except Exception as e:
            print(f"Error loading UI: {e}")
            return
        
        self.setWindowTitle("Heritage System")
        self.showMaximized()
        
        # ✅ Apply modern style (Grey/Charcoal)
        self.apply_modern_style()

        # ---------------------------------------------------------
        # 1. Initialize Pages
        # ---------------------------------------------------------
        self.page_dashboard = DashboardWindow()
        self.page_artifacts = ArtifactsListWindow()
        self.page_add = AddArtifactWindow()
        self.page_settings = SettingsWindow()

        # Add pages to StackedWidget
        self.pagesWidget.addWidget(self.page_dashboard)  # Index 0
        self.pagesWidget.addWidget(self.page_artifacts)  # Index 1
        self.pagesWidget.addWidget(self.page_add)        # Index 2
        self.pagesWidget.addWidget(self.page_settings)   # Index 3

        # ---------------------------------------------------------
        # 2. Users Page Logic (Admin Only)
        # ---------------------------------------------------------
        # Check permissions from Session
        if Session.role == "admin":
            if hasattr(self, "btnUsers"):
                self.btnUsers.show()
                # Initialize Users Page dynamically
                from users import UsersWindow
                self.page_users = UsersWindow()
                self.pagesWidget.addWidget(self.page_users) # Index 4
                
                # Connect Button
                self.btnUsers.clicked.connect(lambda: self.switch_page(4))
        else:
            # Hide button for non-admins
            if hasattr(self, "btnUsers"):
                self.btnUsers.hide()

        # ---------------------------------------------------------
        # 3. Connect Sidebar Buttons
        # ---------------------------------------------------------
        self.btnDashboard.clicked.connect(lambda: self.switch_page(0))
        self.btnArtifacts.clicked.connect(lambda: self.switch_page(1))
        self.btnAddArtifact.clicked.connect(lambda: self.switch_page(2))
        self.btnSettings.clicked.connect(lambda: self.switch_page(3))
        self.btnLogout.clicked.connect(self.logout)

        # ✅ Connect Language Buttons
        self.btnLangAR.clicked.connect(lambda: self.change_language("ar"))
        self.btnLangFR.clicked.connect(lambda: self.change_language("fr"))

        # ---------------------------------------------------------
        # 4. Connect Internal Signals
        # ---------------------------------------------------------
        self.page_add.goArtifacts.connect(lambda: self.switch_page(1))
        self.page_dashboard.goAddArtifact.connect(lambda: self.switch_page(2))
        self.page_artifacts.goAddArtifact.connect(lambda: self.switch_page(2))
        self.page_artifacts.goDetails.connect(self.show_artifact_details)
        
        # Settings internal links if they exist
        if hasattr(self.page_settings, 'goDashboard'): self.page_settings.goDashboard.connect(lambda: self.switch_page(0))
        if hasattr(self.page_settings, 'goArtifacts'): self.page_settings.goArtifacts.connect(lambda: self.switch_page(1))

        # ---------------------------------------------------------
        # 5. Startup
        # ---------------------------------------------------------
        self.change_language(CURRENT_LANG)
        self.switch_page(0)

    def apply_modern_style(self):
        """Forces the Charcoal Grey style on the main window"""
        # Fix logo size
        if hasattr(self, 'label_logo'):
            self.label_logo.setFixedHeight(60)
            self.label_logo.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Fixed)
            
        dark_style = """
        QMainWindow { background-color: #f8f9fa; }
        QWidget { font-family: 'Segoe UI', sans-serif; }
        
        #sidebarFrame {
            background-color: #212529; 
            border: none;
            min-width: 240px; max-width: 240px;
        }
        #label_logo {
            color: white; font-weight: bold; font-size: 18px;
            border-bottom: 1px solid #343a40; margin-top: 10px; padding-bottom: 10px;
        }
        #sidebarFrame QPushButton {
            text-align: right; padding-right: 20px; border: none;
            background-color: transparent; color: #ced4da; 
            font-size: 14px; height: 45px; font-weight: 500;
        }
        #sidebarFrame QPushButton:hover { 
            background-color: #343a40; color: white; border-right: 3px solid #ced4da;
        }
        #sidebarFrame QPushButton:checked { 
            background-color: #343a40; border-right: 3px solid #dc3545; color: white; font-weight: bold; 
        }
        #btnLogout { color: #e57373; margin-top: 20px; }
        #btnLogout:hover { background-color: #495057; color: #ffcdd2; }
        """
        self.setStyleSheet(dark_style)

    def change_language(self, lang_code):
        """Change application language globally"""
        global CURRENT_LANG
        CURRENT_LANG = lang_code
        t = translations[lang_code]
        
        # 1. Change Layout Direction
        direction = Qt.RightToLeft if t["direction"] == "RTL" else Qt.LeftToRight
        self.setLayoutDirection(direction)

        # 2. Update Sidebar Text
        if hasattr(self, "label_logo"): self.label_logo.setText(t["app_title"])
        self.btnDashboard.setText(t["btn_dashboard"])
        self.btnArtifacts.setText(t["btn_artifacts"])
        self.btnAddArtifact.setText(t["btn_add"])
        self.btnSettings.setText(t["btn_settings"])
        self.btnLogout.setText(t["btn_logout"])
        
        if hasattr(self, "btnUsers") and not self.btnUsers.isHidden(): 
            self.btnUsers.setText(t["btn_users"])

        # 3. Propagate Translation to Sub-pages
        self.page_dashboard.set_translation(t)
        self.page_artifacts.set_translation(t)
        self.page_add.set_translation(t)
        self.page_settings.set_translation(t)
        
        if hasattr(self, 'page_users'):
            self.page_users.set_translation(t)
            
        # Update layout direction for all widgets in stack
        for i in range(self.pagesWidget.count()):
            self.pagesWidget.widget(i).setLayoutDirection(direction)

    def switch_page(self, index):
        self.pagesWidget.setCurrentIndex(index)
        
        # Update button states
        self.btnDashboard.setChecked(index == 0)
        self.btnArtifacts.setChecked(index == 1)
        self.btnAddArtifact.setChecked(index == 2)
        self.btnSettings.setChecked(index == 3)
        if hasattr(self, "btnUsers") and not self.btnUsers.isHidden():
            self.btnUsers.setChecked(index == 4)

        # Refresh Data on Page Load
        if index == 0: self.page_dashboard.load_stats()
        if index == 1: self.page_artifacts.load_data()
        if index == 4 and hasattr(self, 'page_users'): self.page_users.load_data()

    def show_artifact_details(self, artifact_id):
        """عرض تفاصيل القطعة"""
        print(f">> فتح تفاصيل القطعة: {artifact_id}")
        
        # 1. إنشاء صفحة التفاصيل
        self.details_page = ArtifactDetailsWindow(artifact_id)
        
        # 2. ربط زر العودة (للرجوع للقائمة)
        self.details_page.goBack.connect(lambda: self.switch_page(1))
        
        # 3. ✅✅✅ ربط زر التعديل (هذا هو السطر المفقود غالباً)
        # عندما نضغط تعديل في التفاصيل -> نفتح صفحة التعديل
        self.details_page.goEdit.connect(self.show_edit_artifact)

        # 4. العرض
        self.pagesWidget.addWidget(self.details_page)
        self.pagesWidget.setCurrentWidget(self.details_page)

    def show_edit_artifact(self, artifact_id):
        """فتح صفحة التعديل"""
        print(f">> تعديل القطعة رقم: {artifact_id}")
        
        # 1. إنشاء صفحة التعديل
        self.edit_page = EditArtifactWindow(artifact_id)
        
        # 2. ربط العودة (سواء بعد الحفظ أو الإلغاء)
        # عند الانتهاء، نعود لصفحة التفاصيل لنرى التعديلات الجديدة
        self.edit_page.goDetails.connect(self.show_artifact_details)
        
        # 3. العرض
        self.pagesWidget.addWidget(self.edit_page)
        self.pagesWidget.setCurrentWidget(self.edit_page)
    def logout(self):
        self.close()
        global login_win
        login_win = LoginWindow()
        login_win.loginSuccess.connect(start_main_app)
        login_win.show()

def start_main_app():
    global window
    window = MainApp()
    window.show()
    if 'login_win' in globals(): login_win.close()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    login_win = LoginWindow()
    login_win.loginSuccess.connect(start_main_app)
    login_win.show()
    sys.exit(app.exec_())
