import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
from app.models.question import FormType


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    departamento = Column(String, nullable=False)
    self_token = Column(String, unique=True, default=lambda: str(uuid.uuid4()), nullable=False)
    self_completado = Column(Boolean, default=False)
    creado_en = Column(DateTime, default=datetime.utcnow)
    form_type = Column(Enum(FormType), nullable=False, default=FormType.most_360, server_default="most_360")

    evaluadores = relationship("Evaluator", back_populates="sujeto", cascade="all, delete-orphan")
    self_respuestas = relationship("SelfAnswer", back_populates="sujeto", cascade="all, delete-orphan")
