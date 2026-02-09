# Feature Specification: Phase IV - Kubernetes Deployment

**Feature Branch**: `main`
**Created**: 2025-02-09
**Status**: Active
**Input**: Deploy Todo Chatbot (Phase 2/3 codebase) to Kubernetes using Minikube and Helm

## Overview

Phase IV focuses on containerizing and deploying the existing Todo Chatbot application (from Phase 2/3) to a local Kubernetes cluster using Minikube. This phase adds production-grade deployment capabilities including containerization, orchestration, ingress routing, and AIOps tooling integration.

## User Scenarios & Testing (mandatory)

### User Story 1 - Local Kubernetes Deployment (Priority: P1)

A developer wants to run the entire Todo Chatbot application in a local Kubernetes environment that mimics production. They start Minikube, build Docker images, deploy using Helm charts, and access the application through a local domain.

**Why this priority**: Foundation for production deployment and local development environment.

**Independent Test**: Deploy to Minikube, verify all pods are running, and access application via Ingress.

**Acceptance Scenarios**:
1. **Given** a developer with Minikube installed, **When** they run the deployment script, **Then** all pods start successfully.
2. **Given** a running deployment, **When** they access `http://todo.local`, **Then** the frontend loads correctly.
3. **Given** a running deployment, **When** they test the chat endpoint, **Then** it responds without errors.

### User Story 2 - Scaling and Resource Management (Priority: P2)

A developer needs to scale the application and manage resource allocation. They use Helm to adjust replicas and resource limits based on their needs.

**Why this priority**: Demonstrates Kubernetes value propositions of scalability and resource efficiency.

**Acceptance Scenarios**:
1. **Given** a running deployment, **When** they scale backend to 3 replicas, **Then** all pods are healthy.
2. **Given** resource constraints, **When** they set CPU/memory limits, **Then** pods respect those limits.

### User Story 3 - AIOps Tool Integration (Priority: P3)

A developer uses AI-powered tools (kubectl-ai, kagent, Gordon) to manage and troubleshoot the deployment without memorizing complex kubectl commands.

**Why this priority**: Reduces operational complexity and speeds up troubleshooting.

**Acceptance Scenarios**:
1. **Given** a deployment issue, **When** they ask kubectl-ai to diagnose, **Then** they get actionable insights.
2. **Given** resource concerns, **When** they ask kagent for optimization, **Then** they receive recommendations.

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: System MUST provide Docker images for both frontend and backend.
- **FR-002**: System MUST include Helm charts for deploying to Kubernetes.
- **FR-003**: System MUST support Ingress for domain-based routing.
- **FR-004**: System MUST include health and readiness probes for all services.
- **FR-005**: System MUST support external Neon PostgreSQL database connection.
- **FR-006**: System MUST use Cohere API for AI chat functionality.
- **FR-007**: System MUST provide deployment scripts for automation.

### Key Components

**Frontend Container:**
- Base Image: node:20-alpine
- Framework: Next.js 16 with standalone output
- Port: 3000
- Health Check: HTTP GET /

**Backend Container:**
- Base Image: python:3.11-slim
- Framework: FastAPI with SQLModel
- Port: 8000
- Health Check: HTTP GET /health

**Infrastructure:**
- Orchestration: Kubernetes (Minikube for local)
- Package Manager: Helm 3.x
- Ingress: nginx
- Database: Neon PostgreSQL (external)

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: All pods reach "Ready" state within 3 minutes of deployment.
- **SC-002**: Application accessible via Ingress at `http://todo.local`.
- **SC-003**: Chat endpoint responds without 500 errors (API key correctly configured).
- **SC-004**: Health and readiness probes pass for all services.
- **SC-005**: Deployment can be scaled to 3 replicas per service without issues.
- **SC-006**: `kubectl-ai` and other AIOps tools can manage the deployment.

### Technical Validation

- [ ] Docker images build successfully
- [ ] Helm charts deploy without errors
- [ ] Ingress routes traffic correctly
- [ ] All environment variables are properly configured
- [ ] Database connectivity works
- [ ] Cohere API integration works
- [ ] Health probes return 200 OK

## Environment Variables (Critical)

### Backend Secrets

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| DATABASE_URL | Neon PostgreSQL connection string | Yes | - |
| COHERE_API_KEY | Cohere API key for chat | Yes | - |
| BETTER_AUTH_SECRET | JWT signing secret | Yes | - |
| PYTHONUNBUFFERED | Python output buffering | No | 1 |

### Frontend Config

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | Yes | http://todo-backend:8000 |
| NODE_ENV | Node environment | No | production |
| PORT | Application port | No | 3000 |

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MINIKUBE CLUSTER                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   INGRESS (nginx)                        ││
│  │                   todo.local                             ││
│  └───────────────────┬─────────────────────────────────────┘│
│                      │                                       │
│         ┌────────────┴────────────┐                         │
│         │ /                       │ /api                    │
│         ▼                         ▼                         │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │   todo-frontend  │    │   todo-backend   │              │
│  │   (Next.js)      │    │   (FastAPI+MCP)  │              │
│  │   Port: 3000     │    │   Port: 8000     │              │
│  │   Replicas: 1-3  │    │   Replicas: 1-3  │              │
│  └──────────────────┘    └────────┬─────────┘              │
│                                   │                         │
└───────────────────────────────────┼─────────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────┐
                         │   Neon Database  │
                         │   (External)     │
                         └──────────────────┘
```

## Edge Cases

- **ImagePullBackOff**: When using Minikube, images must be built with Minikube's Docker daemon.
- **Database Connection Failure**: System should handle external database downtime gracefully.
- **API Key Missing**: Chat endpoint should return clear error when COHERE_API_KEY is not configured.
- **Resource Exhaustion**: Pods should fail gracefully when resource limits are exceeded.
- **Ingress Not Working**: Fallback to port-forwarding for local development.

## Non-Functional Requirements

- **Performance**: API response time < 500ms p95 within cluster
- **Reliability**: 99% uptime for local development (manual restarts acceptable)
- **Scalability**: Support up to 5 replicas per service in Minikube
- **Security**: Secrets stored as Kubernetes Secret objects (not in configmaps)
- **Maintainability**: Helm charts follow best practices and are well-documented

## AIOps Integration

### kubectl-ai
- Natural language interface for kubectl operations
- Examples:
  - `kubectl-ai "scale todo-frontend deployment to 3 replicas"`
  - `kubectl-ai "show logs for todo-backend pods"`
  - `kubectl-ai "why is todo-backend pod not ready?"`

### kagent
- Cluster health analysis and resource optimization
- Examples:
  - `kagent "analyze cluster health"`
  - `kagent "optimize resource allocation for todo-chatbot"`

### Gordon (Docker AI)
- Dockerfile optimization and troubleshooting
- Examples:
  - `docker ai "optimize Dockerfile for todo-chatbot-frontend"`
  - `docker ai "why is my container failing to start?"`

## Out of Scope

- Multi-cluster deployment
- Production cloud deployment (AWS EKS, GKE, AKS)
- CI/CD pipeline integration (GitHub Actions, GitOps)
- Monitoring stack (Prometheus, Grafana)
- Log aggregation (ELK, Loki)
- Service mesh (Istio, Linkerd)
- Advanced networking (Network Policies, CNI customization)

## Dependencies

- Phase 2/3 codebase must be functional
- Docker Desktop installed
- Minikube installed and configured
- kubectl configured for Minikube
- Helm 3.x installed
- Neon PostgreSQL database (external)
- Cohere API key

## Definition of Done

- [ ] Docker images build and run locally
- [ ] Helm charts deploy to Minikube successfully
- [ ] Ingress routes traffic to frontend and backend
- [ ] All pods pass health and readiness checks
- [ ] Chat endpoint works without 500 errors
- [ ] Documentation is complete and accurate
- [ ] AIOps tools can manage the deployment
- [ ] Quick start guide works end-to-end
