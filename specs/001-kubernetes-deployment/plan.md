# Implementation Plan: Kubernetes Deployment for Todo Chatbot

**Branch**: `001-kubernetes-deployment` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-kubernetes-deployment/spec.md`

## Summary

Deploy the Phase III Todo Chatbot (Next.js frontend + FastAPI backend with MCP) to a local Kubernetes cluster using Minikube and Helm charts. The deployment will containerize both services using Docker, create Helm charts for orchestration, and enable AI-assisted operations using kubectl-ai and kagent.

## Technical Context

**Language/Version**: Python 3.11 (backend), Node.js/TypeScript (frontend)
**Primary Dependencies**: Docker, Helm 3.x, Minikube, kubectl, kubectl-ai, kagent
**Storage**: External Neon Serverless PostgreSQL (no local storage needed)
**Testing**: Manual verification via kubectl, helm lint, health endpoints
**Target Platform**: Kubernetes (Minikube for local development)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Pods ready within 3 minutes, health checks <500ms
**Constraints**: Minikube resource limits (4GB RAM recommended), stateless containers
**Scale/Scope**: Single replica per service for local development

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | ✅ PASS | Spec created via /sp.specify, plan via /sp.plan |
| II. Container-First Architecture | ✅ PASS | Separate Dockerfiles for frontend/backend planned |
| III. Kubernetes-Native Deployment | ✅ PASS | Helm charts for Minikube deployment |
| IV. Infrastructure as Code | ✅ PASS | Helm charts in /phase-4/helm/ directory |
| V. AIOps Integration | ✅ PASS | kubectl-ai/kagent usage documented |
| VI. Observability & Debugging | ✅ PASS | Health endpoints /health, /ready required |

**All gates passed. Proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-kubernetes-deployment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Helm chart specs)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (Phase 4 directory)

```text
phase-4/
├── frontend/
│   ├── Dockerfile                    # Next.js production Dockerfile
│   ├── .dockerignore
│   └── ... (copied from phase-3-ai-chatbot/frontend)
├── backend/
│   ├── Dockerfile                    # FastAPI production Dockerfile (exists)
│   ├── .dockerignore
│   └── ... (copied from phase-3-ai-chatbot/backend)
├── helm/
│   ├── todo-frontend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       └── configmap.yaml
│   └── todo-backend/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── deployment.yaml
│           ├── service.yaml
│           └── secret.yaml
├── scripts/
│   ├── build-images.sh               # Docker build script
│   ├── deploy-minikube.sh            # Helm deploy script
│   └── cleanup.sh                    # Teardown script
└── README.md                         # Deployment instructions
```

**Structure Decision**: Using web application structure with frontend and backend in separate directories under phase-4/. Helm charts organized by service in phase-4/helm/. Phase III code will be copied and adapted for Kubernetes deployment.

## Complexity Tracking

> No violations. All constitution principles followed.

---

## Phase 0: Research

### Research Tasks Completed

#### 1. Docker Multi-Stage Builds for Next.js

**Decision**: Use multi-stage Docker build for Next.js frontend
**Rationale**: Reduces final image size significantly (from ~1GB to ~200MB), separates build dependencies from runtime
**Alternatives considered**:
- Single-stage build: Larger image, includes dev dependencies
- Standalone output: Requires additional configuration

#### 2. Kubernetes Deployment Patterns

**Decision**: Use Deployment + Service + Ingress pattern
**Rationale**: Standard Kubernetes pattern for web applications, supports rolling updates and service discovery
**Alternatives considered**:
- StatefulSet: Unnecessary - application is stateless
- DaemonSet: Not applicable - not a node-level service

#### 3. Helm Chart Structure

**Decision**: Separate charts for frontend and backend
**Rationale**: Independent scaling and deployment, cleaner separation of concerns
**Alternatives considered**:
- Monolithic chart: Harder to manage, less flexible
- Umbrella chart: Adds complexity for simple use case

#### 4. Service Communication in Kubernetes

**Decision**: Use Kubernetes DNS for inter-service communication
**Rationale**: Frontend calls backend via `http://todo-backend:8000`, Kubernetes handles DNS resolution
**Alternatives considered**:
- External LoadBalancer: Unnecessary for internal communication
- NodePort: Less portable

#### 5. Health Check Implementation

**Decision**: Backend exposes /health (liveness) and /ready (readiness) endpoints
**Rationale**: Kubernetes probes need these for pod lifecycle management
**Implementation**: FastAPI endpoints returning 200 OK when healthy

#### 6. Secret Management

**Decision**: Use Kubernetes Secrets for sensitive data
**Rationale**: Native K8s solution, can be referenced in pods via environment variables
**Secrets needed**:
- DATABASE_URL (Neon connection string)
- OPENAI_API_KEY
- BETTER_AUTH_SECRET

---

## Phase 1: Design & Contracts

### Data Model (Kubernetes Resources)

See [data-model.md](./data-model.md) for detailed Kubernetes resource specifications.

**Key Resources**:

| Resource Type | Name | Purpose |
|--------------|------|---------|
| Deployment | todo-frontend | Next.js chat UI (1 replica) |
| Deployment | todo-backend | FastAPI + MCP (1 replica) |
| Service | todo-frontend | ClusterIP for frontend |
| Service | todo-backend | ClusterIP for backend |
| Ingress | todo-ingress | External access via Minikube IP |
| Secret | todo-secrets | Database URL, API keys |
| ConfigMap | todo-config | Non-sensitive configuration |

### Contracts (Helm Chart Specifications)

See [contracts/](./contracts/) directory for:
- `frontend-chart-spec.yaml` - Frontend Helm chart specification
- `backend-chart-spec.yaml` - Backend Helm chart specification
- `values-schema.json` - Helm values validation schema

### Quick Start

See [quickstart.md](./quickstart.md) for step-by-step deployment guide.

---

## Implementation Phases

### Phase 1: Setup (Shared Infrastructure)

1. Create phase-4 directory structure
2. Copy Phase III code to phase-4/frontend and phase-4/backend
3. Initialize Helm chart directories

### Phase 2: Containerization (User Story 1)

1. Create frontend Dockerfile with multi-stage build
2. Update backend Dockerfile for Kubernetes (change port to 8000)
3. Create .dockerignore files
4. Build and test images locally with `docker run`

### Phase 3: Helm Charts (User Story 2)

1. Create todo-frontend Helm chart
2. Create todo-backend Helm chart
3. Configure Ingress for frontend access
4. Configure Secrets for sensitive data
5. Validate with `helm lint`

### Phase 4: Minikube Deployment (User Story 2)

1. Start Minikube with sufficient resources
2. Enable ingress addon
3. Build images in Minikube's Docker daemon
4. Deploy using `helm install`
5. Verify pods are running and healthy

### Phase 5: AIOps Integration (User Story 3)

1. Document kubectl-ai usage examples
2. Document kagent usage examples
3. Create deployment scripts

### Phase 6: Production Readiness (User Story 4)

1. Add resource limits to deployments
2. Configure liveness and readiness probes
3. Test pod restart on health check failure

---

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| Minikube resource exhaustion | Set resource limits, document minimum requirements |
| External Neon DB connectivity | Test connectivity before deployment, document firewall requirements |
| Gordon unavailable in region | Provide standard Docker CLI fallback |
| kubectl-ai not installed | Provide manual kubectl equivalents |

---

## Next Steps

Run `/sp.tasks` to generate detailed implementation tasks from this plan.
