import socket
from fastapi import APIRouter
import os


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