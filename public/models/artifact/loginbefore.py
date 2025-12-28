<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>Form</class>
 <widget class="QWidget" name="Form">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>1024</width>
    <height>768</height>
   </rect>
  </property>
  <property name="windowTitle">
   <string>تسجيل الدخول - نظام التراث الثقافي</string>
  </property>
  <property name="styleSheet">
   <string notr="true">QWidget { font-family: 'Segoe UI', sans-serif; }
#leftSidePanel { background: qlineargradient(spread:pad, x1:0, y1:0, x2:1, y2:1, stop:0 #1a237e, stop:1 #283593); border: none; }
#systemTitleLabel { color: white; font-size: 32px; font-weight: bold; }
#systemSubTitleLabel { color: #e0e0e0; font-size: 16px; margin-top: 10px; }
#rightSidePanel { background-color: #ffffff; }
#loginBoxFrame { background-color: transparent; }
#welcomeLabel { font-size: 28px; color: #333333; font-weight: bold; }
#signInLabel { font-size: 14px; color: #666666; margin-bottom: 25px; }
QLineEdit { border: 2px solid #e0e0e0; border-radius: 8px; padding: 12px; font-size: 14px; background-color: #f9f9f9; color: #333; }
QLineEdit:focus { border: 2px solid #1565c0; background-color: #ffffff; }
QPushButton#loginBtn { background-color: #1565c0; color: white; font-size: 16px; font-weight: bold; border-radius: 8px; padding: 14px; border: none; }
QPushButton#loginBtn:hover { background-color: #0d47a1; }
QPushButton#loginBtn:pressed { background-color: #0a357a; }
#errorLabel { color: #d32f2f; font-size: 13px; font-weight: 600; }</string>
  </property>
  <layout class="QHBoxLayout" name="horizontalLayout">
   <property name="spacing"> <number>0</number> </property>
   <property name="leftMargin"> <number>0</number> </property>
   <property name="topMargin"> <number>0</number> </property>
   <property name="rightMargin"> <number>0</number> </property>
   <property name="bottomMargin"> <number>0</number> </property>
   <item>
    <widget class="QFrame" name="leftSidePanel">
     <property name="minimumSize"> <size> <width>400</width> <height>0</height> </size> </property>
     <layout class="QVBoxLayout" name="verticalLayout_2">
      <item> <spacer name="vSpacer1"> <property name="orientation"> <enum>Qt::Vertical</enum> </property> <property name="sizeHint" stdset="0"> <size> <width>20</width> <height>40</height> </size> </property> </spacer> </item>
      <item> <widget class="QLabel" name="systemTitleLabel"> <property name="text"> <string>نظام إدارة
التراث الثقافي</string> </property> <property name="alignment"> <set>Qt::AlignCenter</set> </property> </widget> </item>
      <item> <widget class="QLabel" name="systemSubTitleLabel"> <property name="text"> <string>الحفاظ على الهوية والتاريخ</string> </property> <property name="alignment"> <set>Qt::AlignCenter</set> </property> </widget> </item>
      <item> <spacer name="vSpacer2"> <property name="orientation"> <enum>Qt::Vertical</enum> </property> <property name="sizeHint" stdset="0"> <size> <width>20</width> <height>40</height> </size> </property> </spacer> </item>
     </layout>
    </widget>
   </item>
   <item>
    <widget class="QFrame" name="rightSidePanel">
     <layout class="QVBoxLayout" name="verticalLayout">
      <item>
       <widget class="QFrame" name="loginBoxFrame">
        <property name="minimumSize"> <size> <width>400</width> <height>500</height> </size> </property>
        <property name="maximumSize"> <size> <width>450</width> <height>600</height> </size> </property>
        <layout class="QVBoxLayout" name="verticalLayout_3">
         <property name="spacing"> <number>20</number> </property>
         <property name="leftMargin"> <number>40</number> </property>
         <property name="rightMargin"> <number>40</number> </property>
         <item> <spacer name="vSpacer3"> <property name="orientation"> <enum>Qt::Vertical</enum> </property> <property name="sizeHint" stdset="0"> <size> <width>20</width> <height>40</height> </size> </property> </spacer> </item>
         <item> <widget class="QLabel" name="welcomeLabel"> <property name="text"> <string>مرحباً بعودتك</string> </property> <property name="alignment"> <set>Qt::AlignCenter</set> </property> </widget> </item>
         <item> <widget class="QLabel" name="signInLabel"> <property name="text"> <string>الرجاء تسجيل الدخول للمتابعة</string> </property> <property name="alignment"> <set>Qt::AlignCenter</set> </property> </widget> </item>
         <item> <widget class="QLineEdit" name="usernameInput"> <property name="minimumSize"> <size> <width>0</width> <height>45</height> </size> </property> <property name="placeholderText"> <string>اسم المستخدم</string> </property> </widget> </item>
         <item> <widget class="QLineEdit" name="passwordInput"> <property name="minimumSize"> <size> <width>0</width> <height>45</height> </size> </property> <property name="echoMode"> <enum>QLineEdit::Password</enum> </property> <property name="placeholderText"> <string>كلمة المرور</string> </property> </widget> </item>
         <item> <widget class="QPushButton" name="loginBtn"> <property name="minimumSize"> <size> <width>0</width> <height>50</height> </size> </property> <property name="cursor"> <enum>Qt::PointingHandCursor</enum> </property> <property name="text"> <string>تسجيل الدخول</string> </property> </widget> </item>
         <item> <widget class="QLabel" name="errorLabel"> <property name="minimumSize"> <size> <width>0</width> <height>20</height> </size> </property> <property name="text"> <string/> </property> <property name="alignment"> <set>Qt::AlignCenter</set> </property> </widget> </item>
         <item> <spacer name="vSpacer4"> <property name="orientation"> <enum>Qt::Vertical</enum> </property> <property name="sizeHint" stdset="0"> <size> <width>20</width> <height>40</height> </size> </property> </spacer> </item>
        </layout>
       </widget>
      </item>
     </layout>
    </widget>
   </item>
  </layout>
 </widget>
</ui>
