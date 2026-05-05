from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from app.models import Subject, Evaluator
from app.schemas import SubjectCreate, SubjectOut, SubjectDetail, EvaluatorCreate, EvaluatorOut
from app.services.email_service import enviar_invitacion, enviar_self_assessment

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.post("/", response_model=SubjectOut, status_code=201)
async def crear_sujeto(
    data: SubjectCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    existing = db.query(Subject).filter(Subject.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    sujeto = Subject(
        nombre=data.nombre,
        email=data.email,
        departamento=data.departamento,
        form_type=data.form_type,
    )
    db.add(sujeto)
    db.commit()
    db.refresh(sujeto)

    background_tasks.add_task(
        enviar_self_assessment, sujeto.nombre, sujeto.email, sujeto.self_token
    )

    return sujeto


@router.get("/{subject_id}", response_model=SubjectDetail)
def obtener_sujeto(subject_id: int, db: Session = Depends(get_db)):
    sujeto = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sujeto:
        raise HTTPException(status_code=404, detail="Subject not found")
    return sujeto


@router.post("/{subject_id}/evaluators", response_model=EvaluatorOut, status_code=201)
async def agregar_evaluador(
    subject_id: int,
    data: EvaluatorCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    sujeto = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sujeto:
        raise HTTPException(status_code=404, detail="Subject not found")

    evaluador = Evaluator(
        subject_id=subject_id,
        nombre=data.nombre,
        email=data.email,
        relacion=data.relacion,
        departamento=data.departamento,
    )
    db.add(evaluador)
    db.commit()
    db.refresh(evaluador)

    background_tasks.add_task(
        enviar_invitacion, evaluador.nombre, evaluador.email, sujeto.nombre, evaluador.token
    )

    return evaluador


@router.get("/{subject_id}/evaluators", response_model=list[EvaluatorOut])
def listar_evaluadores(subject_id: int, db: Session = Depends(get_db)):
    sujeto = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sujeto:
        raise HTTPException(status_code=404, detail="Subject not found")
    return sujeto.evaluadores
