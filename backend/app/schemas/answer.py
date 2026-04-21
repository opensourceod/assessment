from pydantic import BaseModel, field_validator


class AnswerItem(BaseModel):
    pregunta_id: int
    puntaje: int

    @field_validator("puntaje")
    @classmethod
    def validar_rango(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("El puntaje debe estar entre 1 y 5")
        return v


class AnswerSubmit(BaseModel):
    respuestas: list[AnswerItem]


class SelfAnswerSubmit(BaseModel):
    respuestas: list[AnswerItem]
