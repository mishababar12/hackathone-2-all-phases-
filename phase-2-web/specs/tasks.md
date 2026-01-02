# Tasks: Phase 2 Web Application

**Input**: Design documents from `phase-2-web/specs/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Backend: Set up `phase-2-web/backend/` with FastAPI and UV dependencies
- [x] T002 Initialize Frontend: Set up `phase-2-web/frontend/` with Next.js 16 (App Router)
- [x] T003 [P] Configure shared environment variables in `phase-2-web/.env` and `.env.local` templates

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 Database Setup: Configure SQLAlchemy/SQLModel connection to Neon PostgreSQL in `phase-2-web/backend/src/db.py`
- [x] T005 [P] Migrations Setup: Initialize Alembic in `phase-2-web/backend/alembic/`
- [x] T006 [P] Auth Framework: Configure Better Auth base and JWT handling in `phase-2-web/frontend/src/lib/auth.ts`
- [x] T007 API Base: Implement root routing and CORS middleware in `phase-2-web/backend/src/main.py`
- [x] T008 [P] Theme Core: Setup `next-themes` and Tailwind config for dark/light mode in `phase-2-web/frontend/tailwind.config.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Secure Account Management (Priority: P1) 🎯 MVP

**Goal**: User can signup and login securely using JWT

**Independent Test**: Register a user via `/signup`, login via `/login`, and verify token exists in storage.

### Implementation for User Story 1

- [x] T009 [P] [US1] Create User model in `phase-2-web/backend/src/models/user.py`
- [x] T010 [US1] Implement Backend Auth Routes (signup/login) in `phase-2-web/backend/src/routes/auth.py`
- [x] T011 [US1] Implement JWT validation middleware in `phase-2-web/backend/src/services/auth_service.py`
- [x] T012 [P] [US1] Create Frontend Signup page in `phase-2-web/frontend/src/app/signup/page.tsx`
- [x] T013 [P] [US1] Create Frontend Login page in `phase-2-web/frontend/src/app/login/page.tsx`
- [x] T014 [US1] Wire up Frontend Auth state and protect the dashboard route

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Lifecycle (Priority: P2)

**Goal**: User can perform all CRUD operations on their private tasks

**Independent Test**: Add, view, update, and delete a task through the dashboard; verify DB reflects changes only for that user.

### Implementation for User Story 2

- [x] T015 [P] [US2] Create Task model in `phase-2-web/backend/src/models/task.py`
- [x] T016 [US2] Implement Task API routes (GET, POST, PUT, DELETE) in `phase-2-web/backend/src/routes/tasks.py`
- [x] T017 [US2] Create Task Component in `phase-2-web/frontend/src/components/TaskItem.tsx`
- [x] T018 [US2] Create Dashboard Page (Task List + Add Form) in `phase-2-web/frontend/src/app/dashboard/page.tsx`
- [x] T019 [US2] Implement Fetch/Mutate hooks for Task CRUD in `phase-2-web/frontend/src/lib/tasks.ts`
- [ ] T020 [US2] Add User-Isolation filter to all Task queries in Backend services

**Checkpoint**: User Story 2 should work independently (using the Auth from US1)

---

## Phase 5: User Story 3 - Responsive Theme Support (Priority: P3)

**Goal**: Responsive UI with dark/light mode persistence

- [x] T021 [P] [US3] Create Theme Toggle component in `phase-2-web/frontend/src/components/ThemeToggle.tsx`
- [x] T022 [US3] Finalize mobile-responsive layout and navigation in `phase-2-web/frontend/src/app/layout.tsx`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T023 [P] Add health check endpoints `/health` to Backend
- [x] T024 [P] Finalize Vercel and Railway deployment configurations
- [x] T025 Run quickstart.md validation for the entire setup

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup -> Foundational**: Must establish folders and deps first.
- **Foundational -> User Stories**: Auth framework and DB connection MUST exist before tasks/users.
- **US1 -> US2**: US2 (Tasks) depends on US1 (Auth) for the `user_id` context.

### Parallel Opportunities
- Backend and Frontend setup (T001, T002) can run together.
- Models (T009, T015) can be created in parallel once migrations are ready.
- Theme setup (T008) can run alongside Auth/DB setup.
- Once API is ready, Frontend Signup/Login (T012, T013) can run in parallel.
