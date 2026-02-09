# Tasks: Kubernetes Deployment for Todo Chatbot

**Input**: Design documents from `/specs/001-kubernetes-deployment/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in spec - manual verification via kubectl and health endpoints.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Phase 4 directory**: `phase-4/`
- **Frontend**: `phase-4/frontend/`
- **Backend**: `phase-4/backend/`
- **Helm charts**: `phase-4/helm/`
- **Scripts**: `phase-4/scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create phase-4 directory structure and copy Phase III code

- [x] T001 Create phase-4 directory structure per implementation plan at phase-4/
- [x] T002 Copy Phase III frontend code from phase-3-ai-chatbot/frontend/ to phase-4/frontend/
- [x] T003 Copy Phase III backend code from phase-3-ai-chatbot/backend/ to phase-4/backend/
- [x] T004 [P] Create phase-4/helm/todo-frontend/ directory structure
- [x] T005 [P] Create phase-4/helm/todo-backend/ directory structure
- [x] T006 [P] Create phase-4/scripts/ directory for deployment scripts

**Checkpoint**: ✅ Directory structure ready for containerization

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend health endpoints required for Kubernetes probes

**⚠️ CRITICAL**: No Kubernetes deployment can work until health endpoints exist

- [x] T007 Add /health endpoint to backend for liveness probe in phase-4/backend/src/main.py
- [x] T008 Add /ready endpoint to backend for readiness probe in phase-4/backend/src/main.py
- [x] T009 Update backend Dockerfile to use port 8000 in phase-4/backend/Dockerfile
- [x] T010 Add next.config.js output: 'standalone' for Next.js in phase-4/frontend/next.config.ts

**Checkpoint**: ✅ Foundation ready - containerization can now begin

---

## Phase 3: User Story 1 - Containerize Applications (Priority: P1) 🎯 MVP

**Goal**: Create Docker images for frontend and backend that can run locally

**Independent Test**: Run `docker build` and `docker run` to verify containers work

### Implementation for User Story 1

- [x] T011 [P] [US1] Create frontend multi-stage Dockerfile in phase-4/frontend/Dockerfile
- [x] T012 [P] [US1] Create frontend .dockerignore in phase-4/frontend/.dockerignore
- [x] T013 [P] [US1] Update backend Dockerfile for K8s compatibility in phase-4/backend/Dockerfile
- [x] T014 [P] [US1] Create backend .dockerignore in phase-4/backend/.dockerignore
- [x] T015 [US1] Create build-images.sh script in phase-4/scripts/build-images.sh
- [x] T016 [US1] Test frontend Docker image builds successfully with docker build
- [x] T017 [US1] Test backend Docker image builds successfully with docker build
- [x] T018 [US1] Test frontend container runs and serves UI with docker build
- [x] T019 [US1] Test backend container runs and responds to /health with docker build

**Checkpoint**: Docker images built and verified locally - MVP complete

---

## Phase 4: User Story 2 - Deploy to Local Kubernetes (Priority: P2)

**Goal**: Deploy containerized application to Minikube using Helm charts

**Independent Test**: Run `helm install` and verify pods reach Running state, access via ingress

### Helm Chart: todo-frontend

- [x] T020 [P] [US2] Create Chart.yaml for frontend in phase-4/helm/todo-frontend/Chart.yaml
- [x] T021 [P] [US2] Create values.yaml for frontend in phase-4/helm/todo-frontend/values.yaml
- [x] T022 [US2] Create deployment.yaml template in phase-4/helm/todo-frontend/templates/deployment.yaml
- [x] T023 [US2] Create service.yaml template in phase-4/helm/todo-frontend/templates/service.yaml
- [x] T024 [US2] Create ingress.yaml template in phase-4/helm/todo-frontend/templates/ingress.yaml
- [x] T025 [US2] Create configmap.yaml template in phase-4/helm/todo-frontend/templates/configmap.yaml

### Helm Chart: todo-backend

- [x] T026 [P] [US2] Create Chart.yaml for backend in phase-4/helm/todo-backend/Chart.yaml
- [x] T027 [P] [US2] Create values.yaml for backend in phase-4/helm/todo-backend/values.yaml
- [x] T028 [US2] Create deployment.yaml template in phase-4/helm/todo-backend/templates/deployment.yaml
- [x] T029 [US2] Create service.yaml template in phase-4/helm/todo-backend/templates/service.yaml
- [x] T030 [US2] Create secret.yaml template in phase-4/helm/todo-backend/templates/secret.yaml

### Deployment Scripts

- [x] T031 [US2] Create deploy-minikube.sh script in phase-4/scripts/deploy-minikube.sh
- [x] T032 [US2] Create cleanup.sh script in phase-4/scripts/cleanup.sh

### Verification

- [ ] T033 [US2] Run helm lint on todo-frontend chart
- [ ] T034 [US2] Run helm lint on todo-backend chart
- [x] T035 [US2] Deploy backend to Minikube and verify pod is Running
- [x] T036 [US2] Deploy frontend to Minikube and verify pod is Running
- [x] T037 [US2] Verify backend /health endpoint via kubectl port-forward
- [ ] T038 [US2] Verify frontend accessible via Minikube ingress
- [ ] T039 [US2] Test end-to-end: send chat message and receive AI response

**Checkpoint**: Application deployed to Minikube and fully functional

---

## Phase 5: User Story 3 - AI-Assisted Operations (Priority: P3)

**Goal**: Document and verify kubectl-ai and kagent operations work with deployment

**Independent Test**: Run kubectl-ai commands successfully against the deployed cluster

### Implementation for User Story 3

- [x] T040 [P] [US3] Document kubectl-ai usage examples in phase-4/README.md
- [x] T041 [P] [US3] Document kagent usage examples in phase-4/README.md
- [x] T042 [P] [US3] Document Gordon (Docker AI) usage examples in phase-4/README.md
- [ ] T043 [US3] Test kubectl-ai scaling command: scale frontend to 2 replicas
- [ ] T044 [US3] Test kubectl-ai logs command: show backend pod logs
- [ ] T045 [US3] Test kubectl-ai describe command: describe backend deployment

**Checkpoint**: AIOps tools verified and documented

---

## Phase 6: User Story 4 - Production-Ready Configuration (Priority: P4)

**Goal**: Add resource limits, health probes, and production configurations

**Independent Test**: Verify pod specs include limits and probes trigger restarts correctly

### Implementation for User Story 4

- [ ] T046 [P] [US4] Add resource requests/limits to frontend deployment in phase-4/helm/todo-frontend/templates/deployment.yaml
- [ ] T047 [P] [US4] Add resource requests/limits to backend deployment in phase-4/helm/todo-backend/templates/deployment.yaml
- [ ] T048 [US4] Add liveness probe to frontend deployment
- [ ] T049 [US4] Add readiness probe to frontend deployment
- [ ] T050 [US4] Verify liveness probe to backend deployment (already in spec)
- [ ] T051 [US4] Verify readiness probe to backend deployment (already in spec)
- [ ] T052 [US4] Test pod restart on simulated health check failure
- [ ] T053 [US4] Verify resource limits are enforced via kubectl describe

**Checkpoint**: Production-ready configuration complete

---

## Phase 7: Polish & Documentation

**Purpose**: Final documentation and cleanup

- [ ] T054 Create comprehensive README.md with setup instructions in phase-4/README.md
- [ ] T055 Add prerequisites section to README (Docker, Minikube, Helm, kubectl)
- [ ] T056 Add troubleshooting section to README
- [ ] T057 Add environment variables documentation to README
- [ ] T058 Create DEPLOYMENT.md with detailed Minikube deployment guide in phase-4/DEPLOYMENT.md
- [ ] T059 Final verification: complete end-to-end deployment on fresh Minikube
- [ ] T060 Record demo video (under 90 seconds) for hackathon submission

**Checkpoint**: Phase IV complete and ready for submission

---

## Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational - Health endpoints)
    ↓
Phase 3 (US1 - Containerization) 🎯 MVP
    ↓
Phase 4 (US2 - Kubernetes Deployment)
    ↓
Phase 5 (US3 - AIOps) ←── Can start after Phase 4
    ↓
Phase 6 (US4 - Production Config) ←── Can start after Phase 4
    ↓
Phase 7 (Polish)
```

## Parallel Execution Opportunities

### Within Phase 1 (Setup)
- T004, T005, T006 can run in parallel (different directories)

### Within Phase 3 (US1)
- T011, T012 (frontend files) parallel with T013, T014 (backend files)

### Within Phase 4 (US2)
- T020, T021 (frontend chart) parallel with T026, T027 (backend chart)

### Within Phase 6 (US4)
- T046, T047 (resource limits) can run in parallel

### Cross-Phase Parallelism
- Phase 5 (US3) and Phase 6 (US4) can start simultaneously after Phase 4

---

## Implementation Strategy

1. **MVP First**: Complete Phase 1-3 for minimal working deployment
2. **Incremental Delivery**: Each phase delivers independently testable value
3. **Parallel Work**: Leverage parallel tasks to speed up implementation
4. **Verify Often**: Each checkpoint should be verified before proceeding

---

## Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|-----------|------------|----------------|
| 1 | Setup | 6 | 3 |
| 2 | Foundational | 4 | 0 |
| 3 | US1 - Containerize | 9 | 4 |
| 4 | US2 - K8s Deploy | 20 | 4 |
| 5 | US3 - AIOps | 6 | 3 |
| 6 | US4 - Production | 8 | 2 |
| 7 | Polish | 7 | 0 |
| **Total** | | **60** | **16** |

**MVP Scope**: Phases 1-3 (19 tasks) - Docker images built and tested locally
**Full Scope**: All phases (60 tasks) - Complete Kubernetes deployment with AIOps
