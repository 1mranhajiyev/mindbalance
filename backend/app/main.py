from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, patients, psychologists, sessions, checkins, goals, tasks, notes
from app.api import onboarding
from app.api import statistics, payments

app = FastAPI(
    title="MindBalance API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,           prefix="/api/v1/auth",                  tags=["auth"])
app.include_router(patients.router,       prefix="/api/v1/patients",              tags=["patients"])
app.include_router(psychologists.router,  prefix="/api/v1/psychologists",         tags=["psychologists"])
app.include_router(sessions.router,       prefix="/api/v1/sessions",              tags=["sessions"])
app.include_router(checkins.router,       prefix="/api/v1/checkins",              tags=["checkins"])
app.include_router(goals.router,          prefix="/api/v1/goals",                 tags=["goals"])
app.include_router(tasks.router,          prefix="/api/v1/tasks",                 tags=["tasks"])
app.include_router(notes.router,          prefix="/api/v1/notes",                 tags=["notes"])
app.include_router(onboarding.router,     prefix="/api/v1/onboarding",            tags=["onboarding"])
app.include_router(statistics.router,     prefix="/api/v1/psychologist/statistics", tags=["statistics"])
app.include_router(payments.router,       prefix="/api/v1/payments",              tags=["payments"])


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
