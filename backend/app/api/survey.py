from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models import Subject, Evaluator, Question, Answer, SelfAnswer
from app.models.question import FormType, QuestionCategory
from app.schemas.answer import AnswerSubmit, SelfAnswerSubmit

router = APIRouter(tags=["survey"])

# Categories that belong to callings/vocational questions — excluded from Individual 360
CALLING_CATEGORIES = {
    QuestionCategory.Impact,
    QuestionCategory.Social_interest,
    QuestionCategory.Technical_Interest,
    QuestionCategory.Influence_interest,
}

# Technical questions excluded from Individual 360 (IDs 28-32)
MOST_360_EXCLUDED_IDS = {28, 29, 30, 31, 32}


def _get_questions(db: Session, form_type: FormType):
    """Return questions for a given subject form_type.
    Individual 360 (most_360) receives competency questions only.
    MOST 2.0 (most_2_0) receives the full question set including callings.
    """
    query = db.query(Question).filter(Question.form_type == FormType.most_2_0)
    if form_type == FormType.most_360:
        query = query.filter(Question.categoria.notin_(CALLING_CATEGORIES))
        query = query.filter(Question.id.notin_(MOST_360_EXCLUDED_IDS))
    return query.order_by(Question.numero).all()




# Label rewrites applied when an external evaluator rates a participant.
# Keys are the original (self-referential) labels; values are the evaluator-facing labels.
EVALUATOR_LABEL_REWRITES: dict[str, str] = {
    "Not demonstrated (I am not aware of and have never demonstrated this ability)": (
        "Not demonstrated (has never demonstrated this knowledge or ability)"
    ),
    "Developing (I am somewhat aware of and inconsistent in demonstrating this ability)": (
        "Developing (somewhat aware of and inconsistent in demonstrating this ability)"
    ),
    "Capable (I am aware of and consistently demonstrate this ability)": (
        "Capable (aware of and consistently demonstrates this ability)"
    ),
    "Outstanding (I am very aware of and consistently excel in demonstrating this ability)": (
        "Outstanding (very aware of and consistently excels in demonstrating this ability)"
    ),
}


def _rewrite_opciones(opciones: list | None) -> list | None:
    """Return opciones with evaluator-specific label wording applied."""
    if not opciones:
        return opciones
    return [
        {**opt, "label": EVALUATOR_LABEL_REWRITES.get(opt["label"], opt["label"])}
        for opt in opciones
    ]


def _format_preguntas(preguntas, evaluator_labels: bool = False):
    """Serialize a list of Question objects including per-question opciones.

    When evaluator_labels=True the option labels are rewritten to use
    third-person wording suitable for external raters.
    """
    return [
        {
            "id": p.id,
            "numero": p.numero,
            "texto": p.texto,
            "categoria": p.categoria,
            "opciones": _rewrite_opciones(p.opciones) if evaluator_labels else p.opciones,
        }
        for p in preguntas
    ]


# --- Evaluator survey (external) ---

@router.get("/survey/{token}")
def obtener_survey(token: str, db: Session = Depends(get_db)):
    evaluador = db.query(Evaluator).filter(Evaluator.token == token).first()
    if not evaluador:
        raise HTTPException(status_code=404, detail="Invalid or expired token")
    if evaluador.completado:
        raise HTTPException(status_code=410, detail="Survey already completed")

    form_type = evaluador.sujeto.form_type
    preguntas = _get_questions(db, form_type)
    return {
        "evaluador_id": evaluador.id,
        "nombre_evaluador": evaluador.nombre,
        "nombre_sujeto": evaluador.sujeto.nombre,
        "relacion": evaluador.relacion,
        "completado": evaluador.completado,
        "form_type": form_type,
        "preguntas": _format_preguntas(preguntas, evaluator_labels=True),
    }


@router.post("/survey/{token}/submit")
def enviar_survey(token: str, data: AnswerSubmit, db: Session = Depends(get_db)):
    evaluador = db.query(Evaluator).filter(Evaluator.token == token).first()
    if not evaluador:
        raise HTTPException(status_code=404, detail="Invalid or expired token")
    if evaluador.completado:
        raise HTTPException(status_code=410, detail="Survey already completed")

    form_type = evaluador.sujeto.form_type
    preguntas_ids = {p.id for p in _get_questions(db, form_type)}
    if len(data.respuestas) != len(preguntas_ids):
        raise HTTPException(status_code=422, detail="Must answer all questions")

    for item in data.respuestas:
        if item.pregunta_id not in preguntas_ids:
            raise HTTPException(status_code=422, detail=f"Invalid question id: {item.pregunta_id}")
        db.add(Answer(
            evaluador_id=evaluador.id,
            pregunta_id=item.pregunta_id,
            puntaje=item.puntaje,
        ))

    evaluador.completado = True
    evaluador.completado_en = datetime.utcnow()
    db.commit()

    return {"message": "Survey submitted successfully. Thank you!"}


# --- Self-assessment survey ---

@router.get("/self/{token}")
def obtener_self_survey(token: str, db: Session = Depends(get_db)):
    sujeto = db.query(Subject).filter(Subject.self_token == token).first()
    if not sujeto:
        raise HTTPException(status_code=404, detail="Invalid or expired token")
    if sujeto.self_completado:
        raise HTTPException(status_code=410, detail="Self-assessment already completed")
    form_type = sujeto.form_type
    preguntas = _get_questions(db, form_type)
    return {
        "subject_id": sujeto.id,
        "nombre": sujeto.nombre,
        "email": sujeto.email,
        "completado": sujeto.self_completado,
        "form_type": sujeto.form_type,
        "preguntas": _format_preguntas(preguntas),
    }


@router.post("/self/{token}/submit")
def enviar_self_survey(token: str, data: SelfAnswerSubmit, db: Session = Depends(get_db)):
    sujeto = db.query(Subject).filter(Subject.self_token == token).first()
    if not sujeto:
        raise HTTPException(status_code=404, detail="Invalid or expired token")
    if sujeto.self_completado:
        raise HTTPException(status_code=410, detail="Self-assessment already completed")
    form_type = sujeto.form_type
    preguntas_ids = {p.id for p in _get_questions(db, form_type)}
    if len(data.respuestas) != len(preguntas_ids):
        raise HTTPException(status_code=422, detail="Must answer all questions")

    # Remove any previously saved (incomplete) answers before re-inserting.
    # Guards against partial submissions caused by crashes or browser retries.
    db.query(SelfAnswer).filter(SelfAnswer.subject_id == sujeto.id).delete()

    for item in data.respuestas:
        if item.pregunta_id not in preguntas_ids:
            raise HTTPException(status_code=422, detail=f"Invalid question id: {item.pregunta_id}")
        db.add(SelfAnswer(
            subject_id=sujeto.id,
            pregunta_id=item.pregunta_id,
            puntaje=item.puntaje,
        ))

    sujeto.self_completado = True
    db.commit()

    return {"message": "Self-assessment submitted successfully!", "subject_id": sujeto.id}
