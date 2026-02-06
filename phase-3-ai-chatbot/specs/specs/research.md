# Phase 0: Research & Implementation Decisions - Phase 2

## Decision 1: Authentication Strategy
- **Decision**: Better Auth with JWT + FastAPI bearer token validation.
- **Rationale**: Provides managed signup/login flows on the frontend while allowing stateless validation on the FastAPI backend using standard JWT patterns.
- **Alternatives Considered**:
  - NextAuth.js: Excellent for FE but session-based can be trickier for separate Python backends.
  - Custom JWT: Higher maintenance and security risk.

## Decision 2: Database Layer
- **Decision**: Neon Serverless PostgreSQL with SQLModel (Backend) and Alembic (Migrations).
- **Rationale**: SQLModel bridges Pydantic and SQLAlchemy, reducing boilerplate. Neon provides easy branching and serverless scaling.
- **Alternatives Considered**:
  - SQLite: Not suitable for production-ready multi-user web apps.
  - Prisma: Strong for TypeScript but doesn't share models with Python backend.

## Decision 3: API Architecture
- **Decision**: RESTful API with structured versioning (`/api/v1`).
- **Rationale**: Industry standard, easy to test, and fits naturally with FastAPI.
- **Alternatives Considered**:
  - GraphQL: Overkill for simple Todo CRUD.

## Decision 4: Theme & Styling
- **Decision**: Tailwind CSS with `next-themes` for Dark/Light mode.
- **Rationale**: Utility-first CSS allows rapid responsive development; `next-themes` handles the hydration and flicker-free theme switching.
