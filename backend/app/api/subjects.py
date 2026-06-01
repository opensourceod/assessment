from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from app.models import Subject, Evaluator
from app.schemas import SubjectCreate, SubjectOut, SubjectDetail, EvaluatorCreate, EvaluatorOut
from app.services.email_service import enviar_invitacion, enviar_self_assessment
from app.services.circle_service import registrar_miembro_circle

router = APIRouter(prefix="/subjects", tags=["subjects"])

# Maximum number of evaluators allowed per plan tier.
# Must stay in sync with PLAN_EVALUATOR_LIMITS in app/schemas/subject.py.
PLAN_EVALUATOR_LIMITS: dict[str, int] = {
    "starter":      10,
    "team":         20,
    "organization": 75,
    "enterprise":   200,
}

# Valid plan identifiers — rejects arbitrary strings coming from the client
VALID_PLANS = set(PLAN_EVALUATOR_LIMITS.keys())


@router.post("/", response_model=SubjectOut, status_code=201)
async def crear_sujeto(
    data: SubjectCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    existing = db.query(Subject).filter(Subject.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Validate plan value when provided
    if data.plan and data.plan not in VALID_PLANS:
        raise HTTPException(status_code=422, detail=f"Invalid plan '{data.plan}'. Must be one of: {', '.join(VALID_PLANS)}")

    sujeto = Subject(
        nombre=data.nombre,
        email=data.email,
        departamento=data.departamento,
        form_type=data.form_type,
        plan=data.plan,
    )
    db.add(sujeto)
    db.commit()
    db.refresh(sujeto)

    if sujeto.plan:
        background_tasks.add_task(
            registrar_miembro_circle, sujeto.nombre, sujeto.email, sujeto.plan
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

    # Enforce plan-based evaluator limit
    limit = PLAN_EVALUATOR_LIMITS.get(sujeto.plan) if sujeto.plan else None
    if limit is not None:
        current_count = db.query(Evaluator).filter(Evaluator.subject_id == subject_id).count()
        if current_count >= limit:
            raise HTTPException(
                status_code=422,
                detail=f"Evaluator limit reached. Your {sujeto.plan.capitalize()} plan allows up to {limit} evaluators.",
            )

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
