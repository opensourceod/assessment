from fastapi_users import schemas
from pydantic import EmailStr


class UserRead(schemas.BaseUser[int]):
    nombre: str
    departamento: str


class UserCreate(schemas.BaseUserCreate):
    nombre: str
    departamento: str


class UserUpdate(schemas.BaseUserUpdate):
    nombre: str
    departamento: str
