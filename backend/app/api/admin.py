from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from app.models import Subject, Evaluator
from app.schemas import SubjectOut
from app.services.auth import fastapi_users

current_superuser = fastapi_users.current_user(active=True, superuser=True)

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(current_superuser)]
)


@router.get("/subjects", response_model=list[SubjectOut])
def listar_sujetos(db: Session = Depends(get_db)):
    return db.query(Subject).order_by(Subject.creado_en.desc()).all()


@router.get("/stats")
def estadisticas_globales(db: Session = Depends(get_db)):
    total_sujetos = db.query(Subject).count()
    total_evaluadores = db.query(Evaluator).count()
    completados = db.query(Evaluator).filter(Evaluator.completado == True).count()
    self_completados = db.query(Subject).filter(Subject.self_completado == True).count()

    tasa = round((completados / total_evaluadores * 100), 1) if total_evaluadores else 0

    return {
        "total_sujetos": total_sujetos,
        "total_evaluadores": total_evaluadores,
        "evaluadores_completados": completados,
        "self_assessments_completados": self_completados,
        "tasa_completitud": tasa,
    }


@router.delete("/subjects/{subject_id}")
def eliminar_sujeto(subject_id: int, db: Session = Depends(get_db)):
    sujeto = db.query(Subject).filter(Subject.id == subject_id).first()
    if not sujeto:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(sujeto)
    db.commit()
    return {"message": f"Subject {subject_id} and all related data deleted"}
