# Research: Kubernetes Deployment for Todo Chatbot

**Feature**: 001-kubernetes-deployment
**Date**: 2026-02-08

## Research Summary

This document consolidates research findings for deploying the Todo Chatbot to Kubernetes using Minikube and Helm charts.

---

## 1. Docker Multi-Stage Builds for Next.js

### Decision
Use multi-stage Docker build for Next.js frontend with standalone output mode.

### Rationale
- Reduces final image size from ~1GB to ~150-200MB
- Separates build-time dependencies from runtime
- Next.js standalone mode includes only required files

### Implementation Pattern
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

### Alternatives Considered
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Single-stage | Simple | Large image (~1GB) | Rejected |
| Multi-stage (chosen) | Small image, clean | More complex Dockerfile | Selected |
| Distroless base | Smallest, secure | Limited debugging | Future consideration |

---

## 2. Kubernetes Deployment Patterns

### Decision
Use Deployment + Service + Ingress pattern for both services.

### Rationale
- Industry standard for stateless web applications
- Supports rolling updates with zero downtime
- Service provides stable internal DNS
- Ingress enables external HTTP access

### Resource Mapping
| Application Component | Kubernetes Resource |
|----------------------|---------------------|
| Frontend app | Deployment (1 replica) |
| Backend app | Deployment (1 replica) |
| Frontend network | Service (ClusterIP) |
| Backend network | Service (ClusterIP) |
| External access | Ingress (nginx) |
| Sensitive config | Secret |
| Non-sensitive config | ConfigMap |

### Alternatives Considered
| Pattern | Use Case | Why Not Used |
|---------|----------|--------------|
| StatefulSet | Stateful apps with ordered pod management | App is stateless |
| DaemonSet | Node-level services (logging, monitoring) | Not applicable |
| Job/CronJob | Batch processing | Not a batch workload |

---

## 3. Helm Chart Structure

### Decision
Create separate Helm charts for frontend and backend services.

### Rationale
- Independent deployment and scaling
- Cleaner separation of concerns
- Easier to version and maintain
- Can be deployed to different namespaces if needed

### Chart Directory Structure
```
helm/
├── todo-frontend/
│   ├── Chart.yaml          # Chart metadata
│   ├── values.yaml         # Default values
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       └── configmap.yaml
└── todo-backend/
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
        ├── deployment.yaml
        ├── service.yaml
        └── secret.yaml
```

### Alternatives Considered
| Structure | Pros | Cons | Verdict |
|-----------|------|------|---------|
| Separate charts (chosen) | Independent, flexible | Multiple installs | Selected |
| Monolithic chart | Single install | Less flexible | Rejected |
| Umbrella chart | Single install with subcharts | Overkill for 2 services | Rejected |

---

## 4. Service Communication in Kubernetes

### Decision
Use Kubernetes DNS for inter-service communication.

### Rationale
- Kubernetes automatically creates DNS entries for Services
- Frontend can reach backend via `http://todo-backend:8000`
- No external network hops for internal traffic
- Works across pod restarts (DNS resolves to current pod IPs)

### DNS Resolution Pattern
```
Service Name: todo-backend
Namespace: default
Full DNS: todo-backend.default.svc.cluster.local
Short DNS: todo-backend (within same namespace)
```

### Frontend Configuration
```yaml
# Environment variable in frontend deployment
env:
  - name: NEXT_PUBLIC_API_URL
    value: "http://todo-backend:8000"
```

---

## 5. Health Check Implementation

### Decision
Backend exposes `/health` (liveness) and `/ready` (readiness) endpoints.

### Rationale
- Kubernetes needs health signals for pod lifecycle management
- Liveness: "Is the app running?" - restart if fails
- Readiness: "Can the app serve traffic?" - remove from service if fails

### Implementation (FastAPI)
```python
@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/ready")
async def ready():
    # Check database connectivity
    try:
        await db.execute("SELECT 1")
        return {"status": "ready"}
    except Exception:
        raise HTTPException(status_code=503, detail="Not ready")
```

### Kubernetes Probe Configuration
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 6. Secret Management

### Decision
Use Kubernetes Secrets for sensitive configuration.

### Rationale
- Native Kubernetes solution
- Can be referenced as environment variables
- Base64 encoded (not encrypted by default, but can be with encryption at rest)
- Easily managed via kubectl or Helm

### Secrets Required
| Secret Key | Purpose | Source |
|------------|---------|--------|
| DATABASE_URL | Neon PostgreSQL connection | Phase III .env |
| OPENAI_API_KEY | OpenAI API access | Phase III .env |
| BETTER_AUTH_SECRET | JWT signing | Phase III .env |

### Secret Creation
```bash
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --from-literal=BETTER_AUTH_SECRET='...'
```

---

## 7. Minikube-Specific Considerations

### Decision
Use Minikube's Docker daemon for image building.

### Rationale
- Avoids pushing images to external registry
- Images built directly in Minikube's Docker environment
- Faster development cycle

### Setup Commands
```bash
# Point shell to Minikube's Docker
eval $(minikube docker-env)

# Build images (now visible to Minikube)
docker build -t todo-chatbot-frontend:latest ./frontend
docker build -t todo-chatbot-backend:latest ./backend

# Use imagePullPolicy: Never in deployments
```

### Required Minikube Addons
| Addon | Purpose | Enable Command |
|-------|---------|----------------|
| ingress | External HTTP access | `minikube addons enable ingress` |
| ingress-dns | DNS for ingress hosts | `minikube addons enable ingress-dns` |
| metrics-server | Resource metrics | `minikube addons enable metrics-server` |

---

## References

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Helm Chart Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
