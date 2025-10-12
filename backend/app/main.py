from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routers import schedules

app = FastAPI(title="UniSchedule API", version="0.1.0")

# CORS for local dev (frontend on 5173 or 5500 etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedules.router, prefix="/api/schedules", tags=["schedules"])

@app.get("/health")
def health():
    return {"ok": True}
