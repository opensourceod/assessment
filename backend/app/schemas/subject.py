from pydantic import BaseModel, EmailStr, model_validator
from datetime import datetime
from typing import Optional
from .evaluator import EvaluatorOut
from app.models.question import FormType

# Must mirror PLAN_EVALUATOR_LIMITS in subjects.py — single source of truth is the API
PLAN_EVALUATOR_LIMITS: dict[str, int] = {
    "starter":      10,
    "team":         20,
    "organization": 75,
    "enterprise":   200,
}


class SubjectCreate(BaseModel):
    nombre: str
    email: EmailStr
    departamento: str
    form_type: FormType = FormType.most_360
    plan: Optional[str] = None


class SubjectOut(BaseModel):
    id: int
    nombre: str
    email: str
    departamento: str
    form_type: FormType
    plan: Optional[str] = None
    evaluator_limit: Optional[int] = None
    self_token: str
    self_completado: bool
    creado_en: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def _set_evaluator_limit(self) -> "SubjectOut":
        if self.plan:
            self.evaluator_limit = PLAN_EVALUATOR_LIMITS.get(self.plan)
        return self


class SubjectDetail(SubjectOut):
    evaluadores: list[EvaluatorOut] = []
