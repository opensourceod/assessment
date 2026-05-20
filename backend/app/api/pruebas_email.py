import os
import re
import base64
import httpx

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

router = APIRouter()

# ==========================================
# VALIDACIÓN EMAIL
# ==========================================
def is_valid_email(email: str) -> bool:
    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    return re.match(pattern, email) is not None


# ==========================================
# MOST 2.0 - SEND EMAIL
# ==========================================
@router.post("/send-pdf-email")
async def send_pdf_email(
    pdf: UploadFile = File(...),
    nombre: str = Form(...),
    email: str = Form(...),

    average: str = Form(...),
    social_interest: str = Form(...),
    social_strength: str = Form(...),
    technical_interest: str = Form(...),
    technical_strength: str = Form(...),
    influence_interest: str = Form(...),
    influence_strength: str = Form(...)
):

    try:

        # ==========================================
        # NORMALIZAR EMAIL
        # ==========================================
        email = email.strip().lower()

        if not is_valid_email(email):
            raise HTTPException(
                status_code=400,
                detail="Email inválido"
            )

        # ==========================================
        # LEER PDF
        # ==========================================
        pdf_bytes = await pdf.read()

        if not pdf_bytes:
            raise HTTPException(
                status_code=400,
                detail="PDF vacío"
            )

        encoded_pdf = base64.b64encode(pdf_bytes).decode("utf-8")

        # ==========================================
        # HTML MOST 2.0
        # ==========================================
        html = f"""
        <html>
        <body style="font-family: Arial;">

            <h2>MOST 2.0 Assessment Report</h2>

            <p>Hola <b>{nombre}</b>,</p>

            <p>Tu reporte MOST 2.0 ha sido generado correctamente.</p>

            <hr>

            <h3>Resultados</h3>

            <ul>
                <li>Average Score: {average}%</li>
                <li>Social Interest: {social_interest}%</li>
                <li>Social Strength: {social_strength}%</li>
                <li>Technical Interest: {technical_interest}%</li>
                <li>Technical Strength: {technical_strength}%</li>
                <li>Influence Interest: {influence_interest}%</li>
                <li>Influence Strength: {influence_strength}%</li>
            </ul>

            <p>Gracias por usar MOST 2.0.</p>

        </body>
        </html>
        """

        # ==========================================
        # PAYLOAD BREVO
        # ==========================================
        payload = {
            "sender": {
                "name": "MOST 2.0",
                "email": os.getenv("BREVO_SENDER_EMAIL")
            },
            "to": [
                {
                    "email": email,
                    "name": nombre
                }
            ],
            "subject": f"MOST 2.0 Report - {nombre}",
            "htmlContent": html,
            "attachment": [
                {
                    "name": f"MOST20_{nombre}.pdf",
                    "content": encoded_pdf
                }
            ]
        }

        headers = {
            "accept": "application/json",
            "api-key": os.getenv("BREVO_API_KEY"),
            "content-type": "application/json"
        }

        # ==========================================
        # ENVIAR CORREO
        # ==========================================
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                "https://api.brevo.com/v3/smtp/email",
                headers=headers,
                json=payload
            )

        # ==========================================
        # VALIDAR RESPUESTA
        # ==========================================
        if response.status_code != 201:
            raise HTTPException(
                status_code=500,
                detail=response.text
            )

        return {
            "success": True,
            "message": "Correo MOST 2.0 enviado correctamente"
        }

    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )