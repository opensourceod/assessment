from pydantic import BaseModel, field_validator


class AnswerItem(BaseModel):
    pregunta_id: int
    # float supports: binary (0/1), ideal (0/25/50/75/100), OD (0/33.33/66.67/100)
    puntaje: float

    @field_validator("puntaje")
    @classmethod
    def validar_rango(cls, v):
        if not 0 <= v <= 100:
            raise ValueError("El puntaje debe estar entre 0 y 100")
        return v


class AnswerSubmit(BaseModel):
    respuestas: list[AnswerItem]


class SelfAnswerSubmit(BaseModel):
    respuestas: list[AnswerItem]
