# Plan: Vocational 360 Assessment Platform

## 🎯 Overview
Plataforma de evaluación vocacional basada en el modelo 360°. Permite contrastar la autopercepción de un sujeto con la visión de observadores externos (jefes, colegas, amigos) utilizando el framework metodológico de **Open Source OD**.

- **Referencia UX:** CDG Assessment 360.
- **Objetivo:** Identificar brechas entre la intención vocacional y la percepción de impacto real.

## 📊 Project Meta
- **Type:** WEB
- **Status:** PLANNING
- **Slug:** vocational-360
- **OS Context:** macOS/Linux (Posix)

link de referencia: https://www.cdg.com.mx/assessment-360
link de las preguntas: https://www.opensourceod.com/openassessment
link del contexto: https://www.opensourceod.com/open

## 💻 Tech Stack
| Layer | Tech | Rationale |
| :--- | :--- | :--- |
| **Backend** | FastAPI | Async support para envío masivo de correos y rapidez de desarrollo. |
| **Database** | SQLite + SQLAlchemy | Persistencia relacional idónea para cruces demográficos complejos. |
| **Frontend** | React (Vite) + Tailwind | Interfaz moderna, responsiva y orientada a micro-interacciones. |
| **Email** | SMTP (fastapi-mail) | Automatización del ciclo de vida de la evaluación (invitación/recordatorio). |
| **Visuals** | Recharts | Generación dinámica de Gráficos de Radar para el Gap Analysis. |

## 🏗️ File Structure
```text
vocational-360/
├── backend/
│   ├── app/
│   │   ├── models/       # DB Entities (User, Evaluator, Question, Answer)
│   │   ├── schemas/      # Pydantic validation (In/Out)
│   │   ├── api/          # Endpoints (auth, assessment, analytics)
│   │   └── services/     # Email worker, Token manager
│   ├── database.db       # SQLite Instance
│   └── alembic.ini       # Migrations config
├── frontend/
│   ├── src/
│   │   ├── components/   # RadarChart, StepForm, ProgressCircle
│   │   ├── pages/        # SubjectDashboard, EvaluatorSurvey, Admin
│   │   └── hooks/        # API consumption
└── .agent/scripts/       # Phase X Validation Scripts


📋 Task Breakdown
Phase 1: Foundation (P0)

    V360-001 [DB Design]: Definir modelos SQLAlchemy.

        Fields: relationship (enum), department (string), years_known (int).

        Verify: alembic upgrade head sin errores.

    V360-002 [Question Seed]: Script de carga de las preguntas de Open Source OD en la base de datos (Escala Likert 1-5).

Phase 2: Orchestration (P1)

    V360-003 [Token Logic]: Generar UUIDs únicos por evaluador para permitir acceso sin registro (Security first).

    V360-004 [Mail Service]: Integración de fastapi-mail para envío de plantillas HTML de invitación.

Phase 3: Interface & Analytics (P2)

    V360-005 [Survey UI]: Formulario React con persistencia local (para no perder progreso) y diseño mobile-first.

    V360-006 [Gap Report]: Dashboard con gráfico de radar comparando Self-Score vs External-Score segmentado por relationship.

🔴 Phase X: Final Verification

    [ ] Security: Ejecutar security_scan.py (Validar que no hay fuga de UUIDs).

    [ ] UX Audit: ux_audit.py (Verificar accesibilidad y contraste de colores en gráficos).

    [ ] Functional: Build de producción exitoso (npm run build).

    [ ] Data Integrity: Comprobar que el borrado de un Sujeto elimina en cascada sus evaluaciones (GDPR compliance).