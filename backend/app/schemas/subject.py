from pydantic import BaseModel, EmailStr
from datetime import datetime
from .evaluator import EvaluatorOut
from app.models.question import FormType


class SubjectCreate(BaseModel):
    nombre: str
    email: EmailStr
    departamento: str
    form_type: FormType = FormType.most_360


class SubjectOut(BaseModel):
    id: int
    nombre: str
    email: str
    departamento: str
    form_type: FormType
    self_token: str
    self_completado: bool
    creado_en: datetime

    model_config = {"from_attributes": True}


class SubjectDetail(SubjectOut):
    evaluadores: list[EvaluatorOut] = []
