# 🛡️ Warranty Guard - AI Driven Warranty Management

**Warranty Guard** היא מערכת Full-Stack מתקדמת שנועדה לפתור את הבעיה המוכרת של אובדן קבלות ושכחה של מועדי פקיעת אחריות. המערכת מאפשרת למשתמשים להעלות צילום קבלה, מחלצת ממנה את הנתונים באופן אוטומטי בעזרת AI, ושולחת התראות רב-ערוציות לפני שהאחריות פוקעת.

---

## 🚀 Key Features

* **AI-Powered OCR:** חילוץ אוטומטי של שם החנות, תאריך הרכישה וסכום הקבלה מתוך קבצי תמונה ו-PDF (באמצעות Tesseract OCR).
* **Automated Notifications:** מערכת התראות אוטונומית השולחת הודעות WhatsApp ומיילים למשתמש 30 יום לפני פקיעת האחריות.
* **Smart Dashboard:** תצוגה ויזואלית של כל המוצרים תחת אחריות, כולל סינון לפי קטגוריות וניהול סטטוסים.
* **Secure Authentication:** מערכת הרשמה והתחברות מאובטחת המבוססת על JWT Bearer Tokens.
* **Responsive UI:** ממשק משתמש מודרני ואינטראקטיבי שנבנה ב-React עם חווית משתמש חלקה.

---

## 🛠️ Tech Stack

### **Backend**
* **Python (FastAPI):** שרת REST API אסינכרוני ומהיר.
* **MongoDB:** מסד נתונים NoSQL גמיש לניהול מסמכים.
* **Tesseract OCR:** מנוע לעיבוד שפה וחילוץ טקסט מתמונות.
* **Asyncio:** ניהול Background Tasks לסריקת דאטה-בייס ושליחת התראות.

### **Frontend**
* **React / Next.js:** Framework לפיתוח צד לקוח מודרני.
* **Tailwind CSS:** עיצוב רספונסיבי ונקי.
* **Zustand:** ניהול State גלובלי (Auth & Data).
* **Lucide React:** אייקונים ועיצוב ויזואלי.

---

## 🏗️ Architecture

המערכת בנויה בארכיטקטורת **Monorepo** עם הפרדה מוחלטת בין ה-Frontend ל-Backend:

```text
Warranty-Guard/
├── backend/    # FastAPI, MongoDB Models, OCR Services
└── frontend/   # React Components, Pages, Stores
