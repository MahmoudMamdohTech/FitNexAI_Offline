# FitNex AI - Offline Development Repository

Welcome to FitNex AI! This repository contains the full-stack codebase optimized for offline, local development. 
The application features a React (Vite) frontend and a Python (FastAPI) backend using an SQLite database and MediaPipe for local AI pose analysis.

## 🚀 Quick Setup Guide

### 1. Backend Setup (FastAPI & AI)
The backend handles authentication, the database, and the AI pose landmarker analysis.

1. Navigate to the backend directory:
   ```bash
   cd python_services
   ```
2. Set up your environment variables by copying the example file:
   ```bash
   cp .env.example .env
   ```
3. Open `python_services/.env` and ensure your database is set to SQLite (this removes the need for an external Supabase connection):
   ```env
   DATABASE_URL=sqlite+aiosqlite:///./fitnex.db
   ```
4. Install the Python dependencies (we recommend creating a virtual environment first):
   ```bash
   pip install -r requirements.txt
   ```

### 2. Frontend Setup (React/Vite)
The frontend contains the UI and directly uses the FastAPI backend.

1. Open a new terminal in the root folder (where `package.json` is).
2. Copy the frontend environment variables:
   ```bash
   cp .env.example .env
   ```
3. Ensure `VITE_AI_URL` points to your local FastAPI server:
   ```env
   VITE_AI_URL=http://localhost:8000
   ```
4. Install Node modules:
   ```bash
   npm install
   ```

---

## 🏃 How to Run the Application
Once you have completed the setup above, you will need to open **two separate terminal windows** every time you want to run the app.

**Terminal 1 (The Backend):**
```bash
cd python_services
uvicorn main:app --reload
```
*(Note: The first time you run this, a `fitnex.db` SQLite file will be automatically created containing all your tables).*

**Terminal 2 (The Frontend):**
Ensure you are in the root directory, then run:
```bash
npm run dev
```
Your app will now be accessible at `http://localhost:5173`.

---

## 🔐 Authentication & OTP (Important for Offline Mode)
Since this offline version does not connect to external SMTP servers (like Gmail), **it will not actually send emails**. 
When you register a new account or request a password reset, the application intercepts the email and **prints the OTP code directly in Terminal 1 (your backend terminal)**.
Simply look at the terminal logs to grab your 6-digit code!

## 🤝 Contributing
Please make sure not to commit any `.env`, `.db` (SQLite), or `node_modules` folders. The `.gitignore` is already set up to exclude these files automatically.

---
---

<div dir="rtl">

# مشروع FitNex AI - النسخة المحلية (بدون إنترنت)

مرحباً بك في FitNex AI! يحتوي هذا المستودع على الكود البرمجي الكامل للمشروع، وقد تم تهيئته ليعمل بشكل محلي بالكامل وبدون الحاجة للاتصال بالإنترنت.
يستخدم المشروع واجهة أمامية مبنية باستخدام React (Vite) وخادم خلفي باستخدام Python (FastAPI) مع قاعدة بيانات SQLite، بالإضافة إلى نموذج MediaPipe لتحليل وضعيات الجسم باستخدام الذكاء الاصطناعي محلياً.

## 🚀 دليل الإعداد السريع

### 1. إعداد الخادم الخلفي (FastAPI & AI)
يقوم الخادم الخلفي بإدارة المصادقة، قاعدة البيانات، وتحليل وضعيات الجسم باستخدام الذكاء الاصطناعي.

1. انتقل إلى مجلد الخادم الخلفي:
   ```bash
   cd python_services
   ```
2. قم بإعداد متغيرات البيئة عن طريق نسخ ملف المثال:
   ```bash
   cp .env.example .env
   ```
3. افتح ملف `python_services/.env` وتأكد من تعيين قاعدة البيانات إلى SQLite (هذا يلغي الحاجة للاتصال الخارجي بـ Supabase):
   ```env
   DATABASE_URL=sqlite+aiosqlite:///./fitnex.db
   ```
4. قم بتثبيت حزم بايثون المطلوبة (نوصي بإنشاء بيئة افتراضية أولاً):
   ```bash
   pip install -r requirements.txt
   ```

### 2. إعداد الواجهة الأمامية (React/Vite)
تحتوي الواجهة الأمامية على واجهة المستخدم وتتصل مباشرة بالخادم الخلفي (FastAPI).

1. افتح نافذة أوامر (Terminal) جديدة في المسار الرئيسي للمشروع (حيث يوجد ملف `package.json`).
2. قم بنسخ متغيرات البيئة الخاصة بالواجهة الأمامية:
   ```bash
   cp .env.example .env
   ```
3. تأكد من أن المتغير `VITE_AI_URL` يشير إلى الخادم المحلي:
   ```env
   VITE_AI_URL=http://localhost:8000
   ```
4. قم بتثبيت حزم Node:
   ```bash
   npm install
   ```

---

## 🏃 كيفية تشغيل التطبيق
بعد الانتهاء من الإعدادات أعلاه، ستحتاج إلى فتح **نافذتي أوامر (Terminals) منفصلتين** في كل مرة ترغب فيها بتشغيل التطبيق.

**نافذة الأوامر الأولى (الخادم الخلفي):**
```bash
cd python_services
uvicorn main:app --reload
```
*(ملاحظة: عند تشغيل الخادم للمرة الأولى، سيتم إنشاء ملف قاعدة بيانات `fitnex.db` تلقائياً ليحتوي على جميع الجداول).*

**نافذة الأوامر الثانية (الواجهة الأمامية):**
تأكد من وجودك في المسار الرئيسي للمشروع، ثم قم بتشغيل:
```bash
npm run dev
```
سيكون تطبيقك متاحاً الآن عبر الرابط `http://localhost:5173`.

---

## 🔐 المصادقة ورمز التحقق (هام جداً للنسخة المحلية)
نظراً لأن هذه النسخة المحلية لا تتصل بخوادم إرسال البريد الإلكتروني الخارجية (مثل Gmail)، **فلن يتم إرسال أي رسائل بريد إلكتروني فعلية**.
عند تسجيل حساب جديد أو طلب إعادة تعيين كلمة المرور، سيقوم النظام بالتقاط الرسالة و**طباعة رمز التحقق (OTP) مباشرة في نافذة الأوامر الأولى (الخاصة بالخادم الخلفي)**.
كل ما عليك فعله هو النظر إلى السجلات في نافذة الأوامر للحصول على الرمز المكون من 6 أرقام!

## 🤝 المساهمة والنشر
يرجى التأكد من عدم رفع ملفات البيئة `.env` أو قواعد البيانات `.db` (SQLite) أو مجلد `node_modules` إلى المستودع. لقد تم إعداد ملف `.gitignore` بالفعل لتجاهل هذه الملفات تلقائياً.

</div>
