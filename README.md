# Assessment 360 MOST Platform

Plataforma de evaluación vocacional basada en el modelo **360°**. Este sistema permite contrastar la autopercepción de un sujeto con la visión de observadores externos (colegas, amigos, jefes), utilizando el framework metodológico de **Open Source OD**.

## 🚀 Guía Rápida de Instalación

### 1. Clonar y Configurar
```bash
git clone <url-del-repo>
cd assessment-360
```

### 2. Backend (FastAPI)
Requiere Python 3.10+.
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
# Opcional: Cargar datos iniciales (preguntas)
python seed.py
# Iniciar servidor
uvicorn main:app --reload
```
La API estará disponible en: `http://localhost:8000`

### 3. Frontend (React + Vite)
Requiere Node.js 18+.
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en: `http://localhost:5173`

---

## 🛠️ Stack Tecnológico

- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) + [SQLAlchemy](https://www.sqlalchemy.org/) (SQLite)
- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **Visualización:** [Recharts](https://recharts.org/) (Gráficos de Radar para Gap Analysis)
- **Email:** `fastapi-mail` para invitaciones automatizadas.

---

## 📂 Estructura del Proyecto

```text
assessment-360/
├── backend/          # API REST y Base de Datos
│   ├── app/          # Lógica principal (models, api, services)
│   ├── database.db   # Instancia SQLite
│   └── seed.py       # Script de carga de datos iniciales
├── frontend/         # Interfaz de usuario (SPA)
│   ├── src/          # Componentes y Hooks de React
│   └── public/       # Assets estáticos
└── preguntas.md      # Referencia de la metodología de evaluación
```

## 🎯 Objetivo
Identificar la brecha entre la **intención vocacional** y la **percepción de impacto real**, proporcionando reportes visuales con análisis de brechas (Gap Analysis).

---
> Proyecto basado en la metodología de [Open Source OD](https://www.opensourceod.com/).