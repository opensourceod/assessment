from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from database import get_db
from app.models import Subject, Evaluator, Question, Answer, SelfAnswer
from app.models.evaluator import RelationshipType
from app.schemas.report import GapReportOut, CategoryScore
from app.services.email_service import enviar_reporte_360


class EmailReportRequest(BaseModel):
    pdf_base64: str

router = APIRouter(prefix="/reports", tags=["reports"])


def _calcular_promedio_por_categoria(puntajes: dict[int, float], preguntas: list) -> dict[str, float]:
    """Agrupa puntajes por categoría y calcula el promedio."""
    categoria_sumas: dict[str, list[float]] = {}
    for p in preguntas:
        if p.id in puntajes:
            cat = p.categoria.value
            categoria_sumas.setdefault(cat, []).append(puntajes[p.id])

    return {cat: round(sum(vals) / len(vals), 2) for cat, vals in categoria_sumas.items()}


def _calcular_promedio_por_competencia(puntajes: dict[int, float], preguntas: list) -> dict[str, float]:
    """Agrupa puntajes por la competencia (sub-categoría) específica y calcula el promedio."""
    mapping = {
        15: "Culture", 16: "Culture", 17: "Culture",
        18: "Psychology", 19: "Psychology", 20: "Psychology",
        21: "Humanity", 22: "Humanity", 23: "Humanity",
        24: "Strategy", 25: "Strategy", 26: "Strategy",
        27: "Design", 28: "Design", 29: "Design",
        30: "Performance", 31: "Performance", 32: "Performance",
        33: "Change", 34: "Change", 35: "Change",
        36: "Consulting", 37: "Consulting", 38: "Consulting",
        39: "Learning", 40: "Learning", 41: "Learning",
    }
    comp_sumas: dict[str, list[float]] = {}
    for p in preguntas:
        if p.id in puntajes and p.numero in mapping:
            comp = mapping[p.numero]
            comp_sumas.setdefault(comp, []).append(puntajes[p.id])

    return {comp: round(sum(vals) / len(vals), 2) for comp, vals in comp_sumas.items()}


@router.get("/{subject_id}", response_model=GapReportOut)
def obtener_reporte(subject_id: int, db: Session = Depends(get_db)):
    sujeto = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sujeto:
        raise HTTPException(status_code=404, detail="Subject not found")

    preguntas = db.query(Question).order_by(Question.numero).all()
    todas_categorias = list({p.categoria.value for p in preguntas})

    # --- Self scores ---
    self_rows = db.query(SelfAnswer).filter(SelfAnswer.subject_id == subject_id).all()
    self_puntajes = {r.pregunta_id: r.puntaje for r in self_rows}
    self_por_categoria = _calcular_promedio_por_categoria(self_puntajes, preguntas)

    # --- External scores (all evaluators) ---
    evaluadores_completados = (
        db.query(Evaluator)
        .filter(Evaluator.subject_id == subject_id, Evaluator.completado == True)
        .all()
    )

    def _avg_por_relacion(relacion: RelationshipType) -> dict[str, float]:
        evs = [e for e in evaluadores_completados if e.relacion == relacion]
        if not evs:
            return {}
        ev_ids = [e.id for e in evs]
        rows = (
            db.query(Answer.pregunta_id, func.avg(Answer.puntaje).label("avg"))
            .filter(Answer.evaluador_id.in_(ev_ids))
            .group_by(Answer.pregunta_id)
            .all()
        )
        puntajes = {r.pregunta_id: float(r.avg) for r in rows}
        return _calcular_promedio_por_categoria(puntajes, preguntas)

    # All external
    if evaluadores_completados:
        all_ev_ids = [e.id for e in evaluadores_completados]
        all_rows = (
            db.query(Answer.pregunta_id, func.avg(Answer.puntaje).label("avg"))
            .filter(Answer.evaluador_id.in_(all_ev_ids))
            .group_by(Answer.pregunta_id)
            .all()
        )
        ext_puntajes = {r.pregunta_id: float(r.avg) for r in all_rows}
        ext_por_categoria = _calcular_promedio_por_categoria(ext_puntajes, preguntas)
    else:
        ext_por_categoria = {}

    manager_scores = _avg_por_relacion(RelationshipType.manager)
    colleague_scores = _avg_por_relacion(RelationshipType.colleague)
    friend_scores = _avg_por_relacion(RelationshipType.friend)

    categorias_out = [
        CategoryScore(
            categoria=cat,
            self_score=self_por_categoria.get(cat),
            external_score=ext_por_categoria.get(cat),
            score_manager=manager_scores.get(cat),
            score_colleague=colleague_scores.get(cat),
            score_friend=friend_scores.get(cat),
        )
        for cat in sorted(todas_categorias)
    ]

    # --- Competency scores (9 categories) ---
    self_por_competencia = _calcular_promedio_por_competencia(self_puntajes, preguntas)

    def _avg_comp_por_relacion(relacion: RelationshipType) -> dict[str, float]:
        evs = [e for e in evaluadores_completados if e.relacion == relacion]
        if not evs:
            return {}
        ev_ids = [e.id for e in evs]
        rows = (
            db.query(Answer.pregunta_id, func.avg(Answer.puntaje).label("avg"))
            .filter(Answer.evaluador_id.in_(ev_ids))
            .group_by(Answer.pregunta_id)
            .all()
        )
        puntajes = {r.pregunta_id: float(r.avg) for r in rows}
        return _calcular_promedio_por_competencia(puntajes, preguntas)

    if evaluadores_completados:
        all_ev_ids = [e.id for e in evaluadores_completados]
        all_rows = (
            db.query(Answer.pregunta_id, func.avg(Answer.puntaje).label("avg"))
            .filter(Answer.evaluador_id.in_(all_ev_ids))
            .group_by(Answer.pregunta_id)
            .all()
        )
        ext_puntajes = {r.pregunta_id: float(r.avg) for r in all_rows}
        ext_por_competencia = _calcular_promedio_por_competencia(ext_puntajes, preguntas)
    else:
        ext_por_competencia = {}

    manager_comp_scores = _avg_comp_por_relacion(RelationshipType.manager)
    colleague_comp_scores = _avg_comp_por_relacion(RelationshipType.colleague)
    friend_comp_scores = _avg_comp_por_relacion(RelationshipType.friend)

    todas_competencias = ["Psychology", "Humanity", "Culture", "Strategy", "Design", "Performance", "Consulting", "Learning", "Change"]

    competencias_out = [
        CategoryScore(
            categoria=comp,
            self_score=self_por_competencia.get(comp),
            external_score=ext_por_competencia.get(comp),
            score_manager=manager_comp_scores.get(comp),
            score_colleague=colleague_comp_scores.get(comp),
            score_friend=friend_comp_scores.get(comp),
        )
        for comp in todas_competencias
    ]

    total = len(sujeto.evaluadores)
    completados = len(evaluadores_completados)

    return GapReportOut(
        subject_id=sujeto.id,
        nombre=sujeto.nombre,
        departamento=sujeto.departamento,
        total_evaluadores=total,
        evaluadores_completados=completados,
        categorias=categorias_out,
        competencias=competencias_out,
    )


@router.post("/{subject_id}/send-report-email")
async def enviar_reporte_email(
    subject_id: int,
    payload: EmailReportRequest,
    db: Session = Depends(get_db),
):
    import base64

    sujeto = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sujeto:
        raise HTTPException(status_code=404, detail="Subject not found")

    try:
        pdf_bytes = base64.b64decode(payload.pdf_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid PDF data")

    await enviar_reporte_360(
        nombre=sujeto.nombre,
        email=sujeto.email,
        pdf_bytes=pdf_bytes,
    )

    return {"success": True, "sent_to": sujeto.email}
