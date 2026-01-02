# Implementation Plan: Phase 2 Web Application

**Branch**: `2-phase-2-webapp` | **Date**: 2025-12-30 | **Spec**: [specs/spec.md](./spec.md)
**Input**: Feature specification from `phase-2-web/specs/spec.md`

## Summary
Build a professional multi-user todo web application using a decoupled architecture. The frontend will be a Next.js 16 (App Router) client, and the backend will be a FastAPI server. Data will be persisted in Neon Serverless PostgreSQL with JWT-based authentication for secure user isolation.

## Technical Context

**Language/Version**: Python 3.13 (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Pydantic (Backend); Next.js 16, Tailwind CSS, Better Auth (Frontend)
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest (API/Unit), Playwright/Cypress (Frontend E2E)
**Target Platform**: Vercel (Frontend), Railway (Backend)
**Project Type**: Monorepo Web Application
**Performance Goals**: < 300ms p95 API latency
**Constraints**: Secure user isolation at DB level; Responsive Design
**Scale/Scope**: Multi-user support with private task lists

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Spec-Driven**: Specification validated and exists in `phase-2-web/specs/spec.md`.
- [x] **Test-First**: Plan includes API contract tests and E2E requirements.
- [x] **Phase Alignment**: Phase II (Web App) follows Phase I (Console).
- [x] **Statelessness**: Application logic is stateless; session stored via JWT.
- [x] **User Isolation**: Enforced via `user_id` on all task queries.

## Project Structure

### Documentation (this feature)

```text
phase-2-web/specs/
├── plan.md              # This file
├── research.md          # Implementation decisions
├── data-model.md        # DB Schema details
├── quickstart.md        # Dev setup
└── contracts/           # API Endpoints definition
```

### Source Code (repository root)

```text
phase-2-web/
├── backend/
│   ├── src/
│   │   ├── models/      # SQLModel models
│   │   ├── routes/      # FastAPI routers
│   │   ├── services/    # Auth/Business logic
│   │   └── main.py      # Entry point
│   ├── tests/
│   │   ├── contract/
│   │   └── unit/
│   └── alembic/         # DB Migrations
│
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js App Router
│   │   ├── components/  # Atomic UI components
│   │   └── lib/         # API hooks and state
│   └── tests/
│       └── e2e/
```

**Structure Decision**: Monorepo structure inside `phase-2-web/` to keep Phase 2 logic self-contained while allowing independent deployment of frontend and backend.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |
