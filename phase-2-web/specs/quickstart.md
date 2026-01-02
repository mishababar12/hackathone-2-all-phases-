# Quickstart: Phase 2 Web Application

## Prerequisites
- Node.js 20+
- Python 3.13+
- UV (Python package manager)
- Neon DB Account

## Backend Setup (FastAPI)
1. Navigate to `phase-2-web/backend/`
2. Create environment file: `cp .env.example .env`
3. Install dependencies: `uv sync`
4. Run migrations: `uv run alembic upgrade head`
5. Start server: `uv run fastapi dev src/main.py`

## Frontend Setup (Next.js)
1. Navigate to `phase-2-web/frontend/`
2. Install dependencies: `npm install`
3. Create environment file: `cp .env.local.example .env.local`
4. Start dev server: `npm run dev`

## Deployment
- **Frontend**: Connect `phase-2-web/frontend/` to Vercel.
- **Backend**: Connect `phase-2-web/backend/` to Railway.
