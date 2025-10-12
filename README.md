# UniSchedule — Planner (Full-Stack Skeleton)

חלוקה ברורה ל-**frontend** ו-**backend**, והפרדת לוגיקה ל-**core** (דומיין) ו-**routers/services** (API).

## מבנה תיקיות
```
unischedule/
├─ backend/
│  ├─ app/
│  │  ├─ main.py                 # אפליקציית FastAPI + CORS + רישום ראוטרים
│  │  ├─ routers/
│  │  │  └─ schedules.py         # REST endpoint: POST /api/schedules/generate
│  │  ├─ core/                   # לוגיקה "טהורה" של הדומיין
│  │  │  ├─ models.py            # מודלים (Block)
│  │  │  └─ scheduler.py         # פרסינג CSV, בדיקת חפיפות, יצירת מערכות, דירוג
│  │  └─ services/
│  │     └─ schedule_service.py  # שכבת שירות (עתידית) לארגון הזרימה
│  ├─ tests/
│  │  └─ test_scheduler.py
│  ├─ requirements.txt
│  └─ README.md
└─ frontend/
   ├─ index.html                 # דף סטטי עם טופס קלט + תוצאות
   ├─ styles.css                 # עיצוב פשוט
   ├─ src/
   │  └─ app.js                  # קריאה ל-API והצגת התוצאות
   └─ README.md
```

## איך מריצים

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
פתח/י את `frontend/index.html` עם Live Server (או כל שרת סטטי).  
ברירת המחדל של ה-API היא `http://localhost:8000` (ניתן לשנות ב-`app.js`).

## פורמט קלט לדוגמה (CSV)
```
Course,Section,Day,Start,End,Location
Algorithms,A1,Sun,10:00,12:00,Building A 101
Algorithms,A1,Wed,10:00,12:00,Building A 101
Algorithms,B1,Sun,08:30,10:00,Building B 202
Algorithms,B1,Wed,08:30,10:00,Building B 202
Data Structures,D1,Mon,12:00,14:00,Comp Lab
Data Structures,D2,Mon,14:00,16:00,Comp Lab
Linear Algebra,L1,Tue,09:00,11:00,Room 12
Linear Algebra,L1,Thu,09:00,11:00,Room 12
Linear Algebra,L2,Tue,11:00,13:00,Room 15
Linear Algebra,L2,Thu,11:00,13:00,Room 15
```

## הערות ארכיטקטורה
- **הפרדת לוגיקה**: הקבצים ב-`core/` נקיים מתלות ב-HTTP. קל לבדוק אותם ולמחזר בעתיד (גם CLI, גם REST).
- **routers**: אחראים על ולידציה של קלט/פלט והפעלת הליבה.
- **services**: שכבה אופציונלית לעתיד (אינטגרציות, cache, DB).

## צעדי המשך
- הוספת סינון קשיח (למשל, "בלי ימי ו'").
- ייצוא `.ics` לכל פתרון.
- שמירת משתמשים/מערכות ב-DB (SQLite + SQLModel).
- UI מתקדם (React/Vite או Streamlit) ותצוגת טיימליין.
