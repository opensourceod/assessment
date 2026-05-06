import enum
from sqlalchemy import Column, Integer, String, Enum, JSON
from database import Base


class FormType(str, enum.Enum):
    most_360 = "most_360"
    most_2_0 = "most_2.0"


class QuestionCategory(str, enum.Enum):
    
    Impact = "Impact"
    Social_interest = "Social Interest"
    Social_OD = "Social OD"
    Technical = "Technical"
    Influence = "OD Competencies Influence"
    Approach="Approach"
    Technical_Interest = "Technical Interest"
    Influence_interest = "Influence Interest"


class Question(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, nullable=False)
    texto = Column(String, nullable=False)
    categoria = Column(Enum(QuestionCategory), nullable=False)
    form_type = Column(Enum(FormType), nullable=False, default=FormType.most_360, server_default="most_360")
    # opciones: [{value, label, display}] — per-question response scale
    opciones = Column(JSON, nullable=True)
