# 🗓️ UniSchedule — Planner (Full-Stack Skeleton)

A minimal yet structured **full-stack project** for generating optimal university schedules from CSV input.  
The project features a clear separation between **frontend** and **backend**, with domain logic isolated in **core**, and API routing in **routers/services**.

---

## 📁 Project Structure
```
unischedule/
├─ backend/
│  ├─ app/
│  │  ├─ main.py                 # FastAPI app + CORS + router registration
│  │  ├─ routers/
│  │  │  └─ schedules.py         # REST endpoint: POST /api/schedules/generate
│  │  ├─ core/                   # Pure domain logic
│  │  │  ├─ models.py            # Models (Block, etc.)
│  │  │  └─ scheduler.py         # CSV parsing, conflict checks, schedule generation & ranking
│  │  └─ services/
│  │     └─ schedule_service.py  # (Future) service layer for orchestrating logic
│  ├─ tests/
│  │  └─ test_scheduler.py
│  ├─ requirements.txt
│  └─ README.md
└─ frontend/
   ├─ index.html                 # Static page with input form and results display
   ├─ styles.css                 # Basic styling
   ├─ src/
   │  └─ app.js                  # Calls the API and renders the results
   └─ README.md
```

---

## 🚀 How to Run

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
Open `frontend/index.html` using **Live Server** or any static file server.  
Default API endpoint: `http://localhost:8000` (can be changed in `src/app.js`).

---

## 🧾 Example Input (CSV)
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

---

## 🧠 Architecture Notes
- **Core logic isolation** – The logic in `core/` is framework-independent (pure Python), making it easy to test and reuse (CLI, REST, etc.).  
- **Routers** – Handle HTTP input/output validation and trigger the core logic.  
- **Services** – Optional abstraction layer for future integrations, caching, or database operations.

---

## 🧩 Next Steps
- Add strict filtering (e.g., “exclude Fridays”).  
- Export each generated schedule as a `.ics` calendar file.  
- Save users and generated schedules in a DB (SQLite + SQLModel).  
- Build an advanced UI (React/Vite or Streamlit) with a visual timeline display.
