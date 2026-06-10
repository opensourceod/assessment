import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum


class RelationshipType(str, enum.Enum):
    manager = "manager"
    colleague = "colleague"
    client = "client"
    friend = "friend"


class Evaluator(Base):
    __tablename__ = "evaluadores"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String, nullable=False)
    email = Column(String, nullable=False)
    relacion = Column(Enum(RelationshipType), nullable=False)
    departamento = Column(String, nullable=True)
    token = Column(String, unique=True, default=lambda: str(uuid.uuid4()), nullable=False)
    completado = Column(Boolean, default=False)
    invitado_en = Column(DateTime, default=datetime.utcnow)
    completado_en = Column(DateTime, nullable=True)

    sujeto = relationship("Subject", back_populates="evaluadores")
    respuestas = relationship("Answer", back_populates="evaluador", cascade="all, delete-orphan")
