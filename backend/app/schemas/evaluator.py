from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.evaluator import RelationshipType


class EvaluatorCreate(BaseModel):
    nombre: str
    email: EmailStr
    relacion: RelationshipType
    departamento: Optional[str] = None


class EvaluatorOut(BaseModel):
    id: int
    nombre: str
    email: str
    relacion: RelationshipType
    departamento: Optional[str]
    completado: bool
    invitado_en: datetime
    completado_en: Optional[datetime]

    model_config = {"from_attributes": True}
