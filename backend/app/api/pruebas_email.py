import socket
import os
import base64
import httpx
import re

from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File,
    Form
)

router = APIRouter()

# ==========================================
# DEBUG SMTP
# ==========================================

@router.get("/debug-mail")
def debug_mail():
    target = os.getenv("MAIL_SERVER")
    ports = [465, 587]

    results = {}

    for port in ports:
        try:
            with socket.create_connection(
                (target, port),
                timeout=5
            ):
                results[port] = "Abierto / Conectado"

        except Exception as e:
            results[port] = f"Bloqueado: {str(e)}"

    return {
        "host": target,
        "test_results": results
    }


# ==========================================
# TEST BREVO
# ==========================================

@router.get("/test-send")
async def test_send():

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": os.getenv("BREVO_API_KEY"),
        "content-type": "application/json"
    }

    payload = {
        "sender": {
            "name": "MOST 2.0",
            "email": "hello@wearequant.com"
        },

        "to": [
            {
                "email": "TU_CORREO@gmail.com",
                "name": "Prueba"
            }
        ],

        "subject": "Prueba desde FastAPI",

        "htmlContent": """
        <html>
          <body>
            <h1>Hola</h1>
            <p>Correo enviado correctamente.</p>
          </body>
        </html>
        """
    }

    async with httpx.AsyncClient() as client:

        response = await client.post(
            url,
            headers=headers,
            json=payload
        )

    return {
        "status_code": response.status_code,
        "response": response.json()
    }


# ==========================================
# SEND PDF EMAIL
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
        # LEER PDF
        # ==========================================

        pdf_bytes = await pdf.read()
        print("PDF SIZE:", len(pdf_bytes))
        print("PDF NAME:", pdf.filename)

        encoded_pdf = base64.b64encode(
            pdf_bytes
        ).decode("utf-8")

        # ==========================================
        # HTML
        # ==========================================

        html = f"""
<html>
<body style="font-family: Arial;">

<h1>MOST 2.0 Assessment</h1>

<p>
Hola {nombre},
</p>

<p>
Tu reporte MOST 2.0 fue generado correctamente.
</p>

<p>
El PDF se encuentra adjunto.
</p>

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

<p>
Gracias por completar MOST 2.0.
</p>

</body>
</html>
"""
        # ==========================================
# VALIDAR EMAIL
# ==========================================

        # ==========================================
# VALIDAR EMAIL
# ==========================================

        email = str(email).strip().lower()

        print("EMAIL RECIBIDO:", email)

        email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

        if not re.match(email_regex, email):

            return {
                "success": False,
                "message": f"Correo inválido: {email}"
            }

        print(
            "PDF BASE64 LENGTH:",
            len(encoded_pdf)
)
        # ==========================================
        # PAYLOAD BREVO
        # ==========================================

        payload = {

            "sender": {
                "name": "MOST 2.0",
                "email": "hello@wearequant.com"
            },

            "to": [
                {
                    "email":email,
                    "name": nombre
                }
            ],

            "subject": f"MOST 2.0 - {nombre}",

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
        # ENVIAR
        # ==========================================

        async with httpx.AsyncClient() as client:

           

                print("BREVO API KEY:", os.getenv("BREVO_API_KEY"))
                print("EMAIL DESTINO:", email)

                response = await client.post(
                    "https://api.brevo.com/v3/smtp/email",
                    headers=headers,
                    json=payload
                )

                print("STATUS:", response.status_code)
                print("RESPONSE TEXT:")
                print(response.text)

        # ==========================================
        # VALIDAR
        # ==========================================

        if response.status_code != 201:
            return {
        "success": False,
        "brevo_error": response.text
    }

        return {
    "success": True,
    "message": "Correo enviado correctamente"
}
    except Exception as e:

        import traceback

        print("========== ERROR BACKEND ==========")
        traceback.print_exc()
        print("===================================")

        raise HTTPException(
            status_code=500,
            detail=str(e)
    )