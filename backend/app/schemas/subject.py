from pydantic import BaseModel, EmailStr
from datetime import datetime
from .evaluator import EvaluatorOut


class SubjectCreate(BaseModel):
    nombre: str
    email: EmailStr
    departamento: str


class SubjectOut(BaseModel):
    id: int
    nombre: str
    email: str
    departamento: str
    self_token: str
    self_completado: bool
    creado_en: datetime

    model_config = {"from_attributes": True}


class SubjectDetail(SubjectOut):
    evaluadores: list[EvaluatorOut] = []
