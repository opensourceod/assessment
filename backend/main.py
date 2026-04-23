from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from database import engine, Base
from app.models import Subject, Evaluator, Question, Answer, SelfAnswer  # noqa: F401 — register models
from app.api import subjects, survey, reports, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="360 MOST Assessment API",
    version="1.0.0",
    description="Platform for 360° vocational assessments using the Open Source OD framework.",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subjects.router, prefix="/api")
app.include_router(survey.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "ok", "service": "360 MOST Assessment API"}
