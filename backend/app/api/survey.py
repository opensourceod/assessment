from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from app.models import Subject, Evaluator, Question, Answer, SelfAnswer
from app.models.question import FormType
from app.schemas.answer import AnswerSubmit, SelfAnswerSubmit

router = APIRouter(tags=["survey"])




def _format_preguntas(preguntas):
    """Serialize a list of Question objects including per-question opciones."""
    return [
        {
            "id": p.id,
            "numero": p.numero,
            "texto": p.texto,
            "categoria": p.categoria,
            "opciones": p.opciones,
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
    if form_type == FormType.most_360 or form_type == FormType.most_2_0:
        question_type = FormType.most_2_0
    else:
        question_type = form_type
    preguntas = (
        db.query(Question)
        .filter(Question.form_type == question_type)
        .order_by(Question.numero)
        .all()
    )
    return {
        "evaluador_id": evaluador.id,
        "nombre_evaluador": evaluador.nombre,
        "nombre_sujeto": evaluador.sujeto.nombre,
        "relacion": evaluador.relacion,
        "completado": evaluador.completado,
        "form_type": form_type,
        "preguntas": _format_preguntas(preguntas),
    }


@router.post("/survey/{token}/submit")
def enviar_survey(token: str, data: AnswerSubmit, db: Session = Depends(get_db)):
    evaluador = db.query(Evaluator).filter(Evaluator.token == token).first()
    if not evaluador:
        raise HTTPException(status_code=404, detail="Invalid or expired token")
    if evaluador.completado:
        raise HTTPException(status_code=410, detail="Survey already completed")

    form_type = evaluador.sujeto.form_type
    if form_type == FormType.most_360 or form_type == FormType.most_2_0:
        question_type = FormType.most_2_0
    else:
        question_type = form_type
    preguntas_ids = {
        p.id for p in db.query(Question).filter(Question.form_type == question_type).all()
    }
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

    question_type = _question_form_type(sujeto.form_type)
    preguntas = (
        db.query(Question)
        .filter(Question.form_type == question_type)
        .order_by(Question.numero)
        .all()
    )
    return {
        "subject_id": sujeto.id,
        "nombre": sujeto.nombre,
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

    preguntas_ids = {
        p.id for p in db.query(Question).filter(Question.form_type == _question_form_type(sujeto.form_type)).all()
    }
    if len(data.respuestas) != len(preguntas_ids):
        raise HTTPException(status_code=422, detail="Must answer all questions")

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
