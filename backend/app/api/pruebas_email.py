import socket
from fastapi import APIRouter
import os
import httpx
from fastapi import HTTPException

router = APIRouter()

@router.get("/debug-mail")
def debug_mail():
    target = os.getenv("MAIL_SERVER")
    ports = [465, 587]
    results = {}
    
    for port in ports:
        try:
            # Esto intenta abrir una conexión TCP pura
            with socket.create_connection((target, port), timeout=5):
                results[port] = "Abierto / Conectado"
        except Exception as e:
            results[port] = f"Bloqueado: {str(e)}"
            
    return {
        "host": target,
        "test_results": results,
        "tip": "Si ambos dicen Bloqueado, Gmail está rechazando el servidor de Railway."
    }


# Endpoint para probar el envío
@router.get("/test-send")
async def test_send():
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": "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", # La clave larga, no la SMTP
        "content-type": "application/json"
    }
    payload = {
        "sender": {"name": "Tu Aplicación", "email": "hello@wearequant.com"},
        "to": [{"email": 'ibiotec30@gmail.com', "name": 'ibio'}],
        "subject": "Prueba desde API",
        "htmlContent": "<html><body><h1>Hola!</h1><p>Enviado vía API REST.</p></body></html>"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        if response.status_code != 201:
            raise HTTPException(status_code=400, detail=f"Error: {response.text}")
        return {"status": "enviado"}
