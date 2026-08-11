from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, patients, psychologists, sessions, checkins, goals, tasks, notes
from app.core.config import settings

app = FastAPI(
    title="MindBalance API",
    description="Psixoloq və pasiyent üçün terapiya platforması",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(psychologists.router, prefix="/api/v1/psychologists", tags=["Psychologists"])
app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["Sessions"])
app.include_router(checkins.router, prefix="/api/v1/checkins", tags=["Check-ins"])
app.include_router(goals.router, prefix="/api/v1/goals", tags=["Goals"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["Notes"])


@app.get("/")
def root():
    return {"message": "MindBalance API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
