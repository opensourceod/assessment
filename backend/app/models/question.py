import enum
from sqlalchemy import Column, Integer, String, Enum
from database import Base


class QuestionCategory(str, enum.Enum):
    innovation = "Innovation"
    learning = "Learning & Adaptation"
    collaboration = "Collaboration"
    psychological_safety = "Psychological Safety"
    leadership = "Leadership"
    engagement = "Engagement"


class Question(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, unique=True, nullable=False)
    texto = Column(String, nullable=False)
    categoria = Column(Enum(QuestionCategory), nullable=False)
