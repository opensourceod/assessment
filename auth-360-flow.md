# Plan de Flujo de Autenticación y Pago para 360 Feedback

## Descripción General
Este plan implementa una pantalla de autenticación y registro para el flujo de la Evaluación 360. Cuando un usuario accede a `/360-feedback`, debe iniciar sesión o registrarse mediante un backend potenciado por FastAPI Users. Si ya está registrado, se le permite pasar directamente. Una vez autenticado, si no tiene una evaluación activa, podrá elegir un plan, pagar y, al recibir una respuesta de pago exitoso, será redirigido a su panel de control 360. El panel se creará de forma automática utilizando sus datos de registro (nombre, correo electrónico y departamento), eliminando la necesidad de completar más formularios.

## Tipo de Proyecto
- **WEB** (Backend completo en FastAPI y Frontend en React/Vite)

## Criterios de Éxito
1. Al acceder a `/360-feedback`, los usuarios no autenticados ven una interfaz pulida de Inicio de Sesión / Registro.
2. Los usuarios autenticados son redirigidos automáticamente a su panel de control 360 si ya cuentan con una evaluación activa.
3. Si no tienen una evaluación activa, seleccionan un plan, realizan el pago y son redirigidos con los parámetros `?plan=<plan>&status=success`.
4. El sistema crea automáticamente un `Subject` a partir de sus datos de usuario registrado y los envía directo a su panel de control 360 sin solicitar datos adicionales en formularios.
5. Se incluye una opción de Cerrar Sesión (Logout) en la barra de navegación.
6. El flujo de MOST 2.0 se mantiene público y sin afectaciones.

## Tecnologías Utilizadas
- **Backend**: FastAPI, SQLAlchemy, FastAPI Users, Estrategia JWT, Transporte Bearer, SQLite/Postgres (según `DATABASE_URL`).
- **Frontend**: React, React Router, Axios, Estilos CSS personalizados.

## Cambios Propuestos en Archivos

### Backend
- `[NUEVO]` [user.py](file:///d:/assessment/backend/app/models/user.py) - Modelo de base de datos para el usuario que hereda de `SQLAlchemyBaseUserTable[int]`.
- `[MODIFICAR]` [__init__.py](file:///d:/assessment/backend/app/models/__init__.py) - Registrar el modelo User.
- `[NUEVO]` [user.py](file:///d:/assessment/backend/app/schemas/user.py) - Esquemas de Pydantic para lectura, creación y actualización de usuarios.
- `[NUEVO]` [auth.py](file:///d:/assessment/backend/app/services/auth.py) - Configurar adaptador de base de datos sync, UserManager, transporte (Bearer), estrategia (JWT) y el objeto principal `fastapi_users`.
- `[MODIFICAR]` [main.py](file:///d:/assessment/backend/main.py) - Incluir las rutas de FastAPI Users para inicio de sesión, registro y gestión de usuarios.
- `[MODIFICAR]` [subjects.py](file:///d:/assessment/backend/app/api/subjects.py) - Agregar rutas `GET /mine` y `POST /create-from-user`. Añadir lógica para vincular `user_id`.
- `[MODIFICAR]` [subject.py](file:///d:/assessment/backend/app/models/subject.py) - Añadir columna `user_id = Column(Integer, ForeignKey("users.id"), nullable=True)` para mapear la evaluación con el usuario.

### Frontend
- `[NUEVO]` [AuthContext.jsx](file:///d:/assessment/frontend/src/context/AuthContext.jsx) - Proveedor de contexto para gestionar el estado de sesión, tokens y peticiones de autenticación.
- `[MODIFICAR]` [main.jsx](file:///d:/assessment/frontend/src/main.jsx) - Envolver la aplicación en `AuthProvider`.
- `[NUEVO]` [AuthForm.jsx](file:///d:/assessment/frontend/src/components/AuthForm.jsx) - Formulario visual premium con pestañas para Iniciar Sesión y Registrarse (pidiendo Nombre, Email, Departamento y Contraseña al registrarse).
- `[MODIFICAR]` [Home.jsx](file:///d:/assessment/frontend/src/pages/Home.jsx) - Integrar la comprobación de autenticación, mostrar `AuthForm` y manejar la creación automática del Subject con el callback de pago.
- `[MODIFICAR]` [Navbar.jsx](file:///d:/assessment/frontend/src/components/Navbar.jsx) - Mostrar el nombre del usuario activo y un botón para Cerrar Sesión.
- `[MODIFICAR]` [client.js](file:///d:/assessment/frontend/src/api/client.js) - Agregar un interceptor de Axios para incluir el encabezado `Authorization: Bearer <token>` de forma automática.

---

## Desglose de Tareas

### Tarea 1: Instalar Dependencias del Backend
- **Agente**: `backend-specialist`
- **Habilidad**: `python-patterns`
- **Prioridad**: Alta
- **Dependencias**: Ninguna
- **ENTRADA**: `requirements.txt`, `pyproject.toml`
- **SALIDA**: Paquetes de FastAPI Users instalados y `pyproject.toml` actualizado.
- **VERIFICACIÓN**: Ejecutar `uv pip list` y confirmar que `fastapi-users` y `fastapi-users-db-sqlalchemy` (o `fastapi-users[sqlalchemy]`) estén en la lista.

### Tarea 2: Crear Modelo de Usuario y Ejecutar Migración
- **Agente**: `database-architect`
- **Habilidad**: `database-design`
- **Prioridad**: Alta
- **Dependencias**: Tarea 1
- **ENTRADA**: Modelos de base de datos
- **SALIDA**: Modelo `backend/app/models/user.py`, columna `user_id` añadida en `backend/app/models/subject.py` y script de migración de alembic.
- **VERIFICACIÓN**: Ejecutar `alembic upgrade head` y verificar que la base de datos tenga la tabla `users` y la columna `user_id` en `subjects`.

### Tarea 3: Configurar Adaptador Sync y Servicio FastAPI Users
- **Agente**: `backend-specialist`
- **Habilidad**: `python-patterns`
- **Prioridad**: Alta
- **Dependencias**: Tarea 2
- **ENTRADA**: Modelo de Usuario
- **SALIDA**: `backend/app/services/auth.py` con el adaptador sync de base de datos personalizado, UserManager, transporte Bearer, estrategia JWT e instancia de `FastAPIUsers`.
- **VERIFICACIÓN**: Ejecutar un script de prueba o arrancar el backend para verificar que compile sin errores de sintaxis.

### Tarea 4: Exponer Endpoints de Autenticación en main.py
- **Agente**: `backend-specialist`
- **Habilidad**: `api-patterns`
- **Prioridad**: Alta
- **Dependencias**: Tarea 3
- **ENTRADA**: `main.py`
- **SALIDA**: Endpoints de registro, login (JWT) y perfil expuestos en la API.
- **VERIFICACIÓN**: Arrancar el backend y comprobar la documentación interactiva en `/docs` para asegurar que las rutas estén disponibles.

### Tarea 5: Añadir APIs de Creación Automatizada de Evaluaciones
- **Agente**: `backend-specialist`
- **Habilidad**: `api-patterns`
- **Prioridad**: Alta
- **Dependencias**: Tarea 4
- **ENTRADA**: `subjects.py`
- **SALIDA**: Endpoints `GET /mine` y `POST /create-from-user` implementados.
- **VERIFICACIÓN**: Confirmar que devuelven 401 sin token y que recuperan/crean la evaluación correctamente al pasar un token JWT válido.

### Tarea 6: Implementar AuthContext y el Interceptor de Axios en Frontend
- **Agente**: `frontend-specialist`
- **Habilidad**: `react-best-practices`
- **Prioridad**: Media
- **Dependencias**: Tarea 5
- **ENTRADA**: Cliente de Axios, React
- **SALIDA**: `AuthContext.jsx` y `client.js` actualizado con el interceptor.
- **VERIFICACIÓN**: Validar que el token JWT almacenado en local storage se adjunte automáticamente en los encabezados HTTP.

### Tarea 7: Crear Formulario de Registro e Inicio de Sesión (AuthForm)
- **Agente**: `frontend-specialist`
- **Habilidad**: `frontend-design`
- **Prioridad**: Media
- **Dependencias**: Tarea 6
- **ENTRADA**: Estructura de componentes
- **SALIDA**: `AuthForm.jsx` con soporte para iniciar sesión y registrarse (solicitando nombre y departamento en el registro).
- **VERIFICACIÓN**: Confirmar que se renderiza con el diseño de la aplicación y que maneja las validaciones correctamente.

### Tarea 8: Actualizar el Flujo de la Página de Inicio (/360-feedback)
- **Agente**: `frontend-specialist`
- **Habilidad**: `frontend-design`
- **Prioridad**: Media
- **Dependencias**: Tarea 7
- **ENTRADA**: `Home.jsx`
- **SALIDA**: Gestión de flujo:
  - Si el usuario no está logueado -> se muestra `AuthForm`.
  - Si está logueado -> se verifica si tiene un Subject activo (`GET /api/subjects/mine`). Si existe -> redirigir a `/dashboard/:id`. Si no -> mostrar los planes de pago.
  - Al regresar del pago (`?plan=<plan>&status=success`), llamar a la API para crear la evaluación de forma automática y redirigir al panel.
- **VERIFICACIÓN**: Probar el flujo completo de registro -> selección de plan -> simulador de pago -> redirección automática al panel del Subject.

### Tarea 9: Integración de Navbar
- **Agente**: `frontend-specialist`
- **Habilidad**: `frontend-design`
- **Prioridad**: Baja
- **Dependencias**: Tarea 8
- **ENTRADA**: `Navbar.jsx`
- **SALIDA**: Nombre del usuario activo y botón de Cerrar Sesión integrados.
- **VERIFICACIÓN**: Al pulsar Cerrar Sesión, se limpia el token del storage y se redirige a la pantalla de login.

---

## Fase X: Plan de Verificación

### Pruebas Automatizadas y Scripts de Calidad
- Ejecutar `python .agent/scripts/checklist.py .` para validar calidad de código, sintaxis, esquema de base de datos y análisis de seguridad.
- Ejecutar `npm run build` en la carpeta del frontend para asegurar que no haya errores de compilación.

### Verificación Manual
1. Acceder a `/360-feedback` sin sesión -> verificar que se muestre el formulario de autenticación.
2. Registrarse con un usuario nuevo (ej. Jane Doe, jane@company.com, Ingeniería).
3. Confirmar que tras el registro se muestra la selección de planes de pago.
4. Seleccionar el plan Starter y hacer clic en pagar.
5. Al regresar con el callback (`?plan=starter&status=success`), verificar que el sistema cree la evaluación automáticamente y acceda al panel de control `/dashboard/:id` sin pedir datos adicionales.
6. Cerrar sesión y verificar que se limpie el storage y se regrese a la pantalla de login.
7. Iniciar sesión con el usuario creado y comprobar que redirige directamente a su dashboard `/dashboard/:id`.
8. Comprobar que MOST 2.0 (`/most-2.0`) sigue funcionando de manera pública sin pedir inicio de sesión.

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-06-03

