from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from database import engine, Base
from app.models import Subject, Evaluator, Question, Answer, SelfAnswer  # noqa: F401 — register models
from app.api import subjects, survey, reports, admin, pruebas_email
from app.api.email_routes import router as email_router


from app.services.auth import auth_backend, fastapi_users
from app.schemas.user import UserRead, UserCreate, UserUpdate

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

# Authentication routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/api/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/api/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/api/users",
    tags=["users"],
)

app.include_router(subjects.router, prefix="/api")
app.include_router(survey.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(pruebas_email.router, prefix="/api")
app.include_router(email_router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "360 MOST Assessment API"}
