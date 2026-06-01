from fastapi import APIRouter, UploadFile, File, Form
from app.services.email_service import enviar_most_pdf

router = APIRouter(tags=["email"])


@router.post("/send-pdf-email")
async def send_pdf_email(
    pdf: UploadFile = File(...),
    nombre: str = Form(...),
    email: str = Form(...),

    average: str = Form(None),
    social_interest: str = Form(None),
    social_strength: str = Form(None),
    technical_interest: str = Form(None),
    technical_strength: str = Form(None),
    influence_interest: str = Form(None),
    influence_strength: str = Form(None)
):

    try:
        pdf_bytes = await pdf.read()

        # 🔥 VALIDACIÓN REAL
        if not pdf_bytes or len(pdf_bytes) < 100:
            return {
                "success": False,
                "error": "PDF inválido o no generado"
            }

        if not email or "@" not in email:
            return {
                "success": False,
                "error": "Email inválido"
            }

        result = await enviar_most_pdf(
                nombre=nombre,
                email=email,

                average=average or "0",
                social_interest=social_interest or "0",
                social_strength=social_strength or "0",

                technical_interest=technical_interest or "0",
                technical_strength=technical_strength or "0",

                influence_interest=influence_interest or "0",
                influence_strength=influence_strength or "0",

                pdf_bytes=pdf_bytes
        )

        return result

    except Exception as e:
        print("❌ ERROR BACKEND:", str(e))
        return {
            "success": False,
            "error": str(e)
        }
    
