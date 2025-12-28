import sys
from PyQt5.QtWidgets import QWidget, QTableWidgetItem, QGraphicsDropShadowEffect
from PyQt5.uic import loadUi
from PyQt5.QtCore import pyqtSignal, Qt
from PyQt5.QtGui import QColor, QFont, QPainter
from PyQt5.QtChart import QChart, QChartView, QPieSeries, QBarSeries, QBarSet, QBarCategoryAxis, QValueAxis
from db import db

class DashboardWindow(QWidget):
    goAddArtifact = pyqtSignal()

    def __init__(self):
        super().__init__()
        try:
            loadUi("dashboard.ui", self)
        except Exception as e:
            print(f"Error loading dashboard.ui: {e}")
            return

        self.apply_clean_shadows()
        self.load_stats()
        self.create_pie_chart()
        self.create_bar_chart()

    def apply_clean_shadows(self):
        cards = [self.cardTotal, self.cardStorage, self.cardUsers, self.cardAlert, 
                 self.chartFrame1, self.chartFrame2, self.recentContainer]
        for card in cards:
            shadow = QGraphicsDropShadowEffect()
            shadow.setBlurRadius(15)
            shadow.setXOffset(0)
            shadow.setYOffset(4)
            shadow.setColor(QColor(0, 0, 0, 20))
            card.setGraphicsEffect(shadow)

    def load_stats(self):
        try:
            # الأرقام الأساسية
            self.valArtifacts.setText(str(db.count("artifacts")))
            self.valStorage.setText(str(db.count("storage_locations")))
            self.valUsers.setText(str(db.count("users")))
            
            # ✅ جلب تنبيهات الصيانة الحقيقية
            alerts = db.get_maintenance_alerts_count()
            self.valAlerts.setText(str(alerts))
            
            # تغيير لون الرقم للأحمر إذا كان هناك تنبيهات
            if alerts > 0:
                self.valAlerts.setStyleSheet("color: #e74c3c;")
            else:
                self.valAlerts.setStyleSheet("color: #2c3e50;")

            # الجدول
            recent_items = db.get_recent_artifacts(limit=5)
            self.tableRecent.setRowCount(len(recent_items))
            self.tableRecent.setColumnWidth(0, 150)
            self.tableRecent.setColumnWidth(1, 400)
            self.tableRecent.verticalHeader().setVisible(False)
            self.tableRecent.setAlternatingRowColors(True)

            for i, row in enumerate(recent_items):
                self.tableRecent.setItem(i, 0, QTableWidgetItem(str(row[0])))
                self.tableRecent.setItem(i, 1, QTableWidgetItem(row[1]))

        except Exception as e:
            print(f"Error loading stats: {e}")

    def create_pie_chart(self):
        """Pie Chart بألوان مخصصة ومتباينة"""
        series = QPieSeries()
        series.setHoleSize(0.40) 
        
        data = db.get_artifacts_by_type() 
        
        # ✅ قائمة ألوان متباينة (Contrast Palette)
        colors = [
            "#3498db", # أزرق
            "#e74c3c", # أحمر
            "#f1c40f", # أصفر
            "#2ecc71", # أخضر
            "#9b59b6", # بنفسجي
            "#34495e", # كحلي
            "#e67e22", # برتقالي
            "#1abc9c"  # تركواز
        ]

        if not data:
            slice_ = series.append("لا توجد بيانات", 1)
            slice_.setBrush(QColor("#ecf0f1"))
            slice_.setLabelVisible(True)
        else:
            for i, (name, count) in enumerate(data):
                slice_ = series.append(name, count)
                # تعيين لون مختلف لكل شريحة من القائمة
                color_hex = colors[i % len(colors)] 
                slice_.setBrush(QColor(color_hex))
                slice_.setLabelVisible(True)

        chart = QChart()
        chart.addSeries(series)
        chart.setTitle("توزيع القطع حسب النوع")
        chart.setTitleFont(QFont("Segoe UI", 12, QFont.Bold))
        chart.setTitleBrush(QColor("#2c3e50")) 
        
        chart.legend().setVisible(True)
        chart.legend().setAlignment(Qt.AlignRight)
        
        chartview = QChartView(chart)
        chartview.setRenderHint(QPainter.Antialiasing)
        
        if self.chartLayout1.count() > 0: 
             self.chartLayout1.itemAt(0).widget().deleteLater()
        self.chartLayout1.addWidget(chartview)

    def create_bar_chart(self):
        data = db.get_artifacts_by_condition()
        if not data: return 

        set0 = QBarSet("العدد")
        set0.setColor(QColor("#1abc9c")) # لون تركواز مميز للأعمدة
        
        categories = []
        max_val = 0
        for name, count in data:
            set0.append(count)
            categories.append(name)
            if count > max_val: max_val = count
            
        series = QBarSeries()
        series.append(set0)

        chart = QChart()
        chart.addSeries(series)
        chart.setTitle("حالة الأصول")
        chart.setTitleFont(QFont("Segoe UI", 12, QFont.Bold))
        chart.setTitleBrush(QColor("#2c3e50"))

        axisX = QBarCategoryAxis()
        axisX.append(categories)
        chart.addAxis(axisX, Qt.AlignBottom)
        series.attachAxis(axisX)

        axisY = QValueAxis()
        axisY.setRange(0, max_val + 2)
        chart.addAxis(axisY, Qt.AlignLeft)
        series.attachAxis(axisY)

        chart.legend().setVisible(False)

        chartview = QChartView(chart)
        chartview.setRenderHint(QPainter.Antialiasing)

        if self.chartLayout2.count() > 0:
             self.chartLayout2.itemAt(0).widget().deleteLater()
        self.chartLayout2.addWidget(chartview)

    def set_translation(self, t):
        if hasattr(self, "lblWelcome"): self.lblWelcome.setText(t["dash_welcome"])
        if hasattr(self, "lblSub"): self.lblSub.setText(t["dash_sub"])
        if hasattr(self, "t1"): self.t1.setText(t["card_total"])
        if hasattr(self, "t2"): self.t2.setText(t["card_storage"])
        if hasattr(self, "t3"): self.t3.setText(t["card_users"])
        if hasattr(self, "t4"): self.t4.setText(t["card_alerts"])
        if hasattr(self, "lblSectionTitle"): self.lblSectionTitle.setText(t["recent_title"])
        if hasattr(self, "tableRecent"):
            self.tableRecent.setHorizontalHeaderLabels([t["tbl_code"], t["tbl_name"]])
