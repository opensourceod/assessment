from pydantic import BaseModel
from typing import Optional


class CategoryScore(BaseModel):
    categoria: str
    self_score: Optional[float]
    external_score: Optional[float]
    score_manager: Optional[float]
    score_colleague: Optional[float]
    score_friend: Optional[float]


class GapReportOut(BaseModel):
    subject_id: int
    nombre: str
    departamento: str
    total_evaluadores: int
    evaluadores_completados: int
    categorias: list[CategoryScore]
    competencias: list[CategoryScore]
