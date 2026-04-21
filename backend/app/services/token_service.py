import uuid


def generar_token() -> str:
    """Genera un UUID v4 único para acceso sin registro."""
    return str(uuid.uuid4())
