from sqlalchemy import Column, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from database import Base


class Answer(Base):
    """Respuesta de un evaluador externo."""
    __tablename__ = "respuestas"

    id = Column(Integer, primary_key=True, index=True)
    evaluador_id = Column(Integer, ForeignKey("evaluadores.id", ondelete="CASCADE"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)
    puntaje = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint("puntaje >= 1 AND puntaje <= 5", name="check_puntaje_rango"),
    )

    evaluador = relationship("Evaluator", back_populates="respuestas")
    pregunta = relationship("Question")


class SelfAnswer(Base):
    """Respuesta del sujeto sobre sí mismo (self-assessment)."""
    __tablename__ = "self_respuestas"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)
    puntaje = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint("puntaje >= 1 AND puntaje <= 5", name="check_self_puntaje_rango"),
    )

    sujeto = relationship("Subject", back_populates="self_respuestas")
    pregunta = relationship("Question")
