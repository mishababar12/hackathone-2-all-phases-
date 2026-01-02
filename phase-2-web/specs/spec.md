# Feature Specification: Phase 2 Full-Stack Web App

**Feature Branch**: `2-phase-2-webapp`
**Created**: 2025-12-30
**Status**: Draft
**Input**: Create full-stack web app with Next.js, FastAPI, JWT Auth, and Neon PostgreSQL.

## User Scenarios & Testing (mandatory)

### User Story 1 - Secure Account Management (Priority: P1)

A new user visits the application, creates an account with their email and password, and logs in. Once authenticated, they are greeted by their personal dashboard where they can see that their session is secure and isolated from other users.

**Why this priority**: Security and user isolation are foundational for a multi-user todo system.

**Independent Test**: Register a user, verify JWT generation on login, and ensure protected endpoints reject unauthenticated requests.

**Acceptance Scenarios**:
1. **Given** a new visitor on the registration page, **When** they provide valid credentials, **Then** an account is created.
2. **Given** a registered user on the login page, **When** they provide correct credentials, **Then** they receive a JWT token and access the dashboard.
3. **Given** an unauthenticated visitor, **When** they try to access the dashboard, **Then** they are redirected to login.

---

### User Story 2 - Task Lifecycle (Priority: P2)

An authenticated user creates several tasks, views them in a list, updates a task title, and marks a task as done. Later, they delete a task that is no longer needed.

**Why this priority**: Core utility of the application (CRUD).

**Independent Test**: Perform each CRUD operation via UI/API and verify persistence in Neon PostgreSQL.

**Acceptance Scenarios**:
1. **Given** an authenticated user, **When** they add a task, **Then** it appears in their list and is stored in DB.
2. **Given** an existing task, **When** a user clicks complete, **Then** status updates visually and in DB.
3. **Given** an unwanted task, **When** a user clicks delete, **Then** it is permanently removed.

---

### User Story 3 - Responsive Theme Support (Priority: P3)

A user toggles between dark and light modes according to their preference and environment. They access the app on both desktop and mobile devices without layout issues.

**Why this priority**: Accessibility and cross-device usability.

**Acceptance Scenarios**:
1. **Given** the app, **When** the user toggles theme, **Then** the UI colors update instantly.
2. **Given** a mobile screen size, **When** viewing the dashboard, **Then** elements stack properly without horizontal scroll.

### Edge Cases
- **Database Downtime**: Backend MUST return 503; Frontend SHOULD show a friendly error state.
- **Expired Tokens**: System MUST redirect to login when JWT expires.
- **Invalid Input**: System MUST return 400 Bad Request for malformed task data.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: System MUST provide secure registration and JWT auth using Better Auth patterns.
- **FR-002**: System MUST allow CRUD operations (Add, View, Update, Delete) for tasks.
- **FR-003**: System MUST enforce user isolation at the database level using `user_id`.
- **FR-004**: Frontend MUST be responsive using Next.js 16 (App Router) and Tailwind CSS.
- **FR-005**: System MUST store data in Neon Serverless PostgreSQL using migrations.

### Key Entities
- **User**: ID (UUID), email (unique), hashed_password, created_at.
- **Task**: ID (Serial), user_id (FK), title (200 chars), completed (bool), created_at.

## Success Criteria (mandatory)

### Measurable Outcomes
- **SC-001**: E2E flow (signup -> login -> task create) completion in < 60 seconds.
- **SC-002**: API response time < 300ms p95.
- **SC-003**: Lighthouse accessibility score of 100 on primary pages.
- **SC-004**: Deployment successful on Vercel (FE) and Railway (BE).
