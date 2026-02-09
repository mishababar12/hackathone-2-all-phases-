# Phase IV: Todo Chatbot Kubernetes Deployment

Deploy the Todo Chatbot AI application to local Kubernetes (Minikube) using Docker and Helm charts.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Deployment Steps](#deployment-steps)
- [AIOps Tools](#aiops-tools)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Prerequisites

| Tool | Version | Check Command | Install Guide |
|------|---------|---------------|---------------|
| Docker Desktop | 4.53+ | `docker --version` | [docker.com](https://docker.com/get-docker) |
| Minikube | 1.32+ | `minikube version` | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/) |
| kubectl | 1.28+ | `kubectl version --client` | Included with Docker Desktop |
| Helm | 3.x | `helm version` | [helm.sh](https://helm.sh/docs/intro/install/) |
| kubectl-ai | Latest | `kubectl-ai --help` | [github.com/sozercan/kubectl-ai](https://github.com/sozercan/kubectl-ai) |

## Quick Start

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=4096
minikube addons enable ingress

# 2. Point to Minikube's Docker
eval $(minikube docker-env)

# 3. Build images
./scripts/build-images.sh --minikube

# 4. Create secrets (edit with your values first)
cp secrets.yaml.example secrets.yaml
# Edit secrets.yaml with your DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET
kubectl apply -f secrets.yaml

# 5. Deploy
./scripts/deploy-minikube.sh

# 6. Access application
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts
open http://todo.local
```

## Architecture

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

## Project Structure

```
phase-4/
├── frontend/
│   ├── Dockerfile           # Multi-stage Next.js build
│   ├── .dockerignore
│   └── src/                 # Next.js application
├── backend/
│   ├── Dockerfile           # Python FastAPI build
│   ├── .dockerignore
│   └── src/                 # FastAPI + MCP application
├── helm/
│   ├── todo-frontend/       # Frontend Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── todo-backend/        # Backend Helm chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── scripts/
│   ├── build-images.sh      # Docker build script
│   ├── deploy-minikube.sh   # Deployment script
│   └── cleanup.sh           # Cleanup script
└── README.md
```

## Deployment Steps

### Step 1: Start Minikube

```bash
minikube start --cpus=4 --memory=4096 --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
```

### Step 2: Configure Docker

```bash
# Point to Minikube's Docker daemon
eval $(minikube docker-env)
```

### Step 3: Build Docker Images

```bash
./scripts/build-images.sh --minikube

# Verify images
docker images | grep todo-chatbot
```

### Step 4: Create Secrets

```bash
# Create secrets file
kubectl create secret generic todo-backend-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --from-literal=BETTER_AUTH_SECRET='your-secret'
```

### Step 5: Deploy with Helm

```bash
# Deploy backend
helm install todo-backend ./helm/todo-backend --set secrets.create=false

# Wait for backend
kubectl wait --for=condition=ready pod -l component=backend --timeout=120s

# Deploy frontend
helm install todo-frontend ./helm/todo-frontend

# Verify
kubectl get pods
```

### Step 6: Access Application

```bash
# Add to hosts file
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts

# Open browser
open http://todo.local

# Or use port-forward
kubectl port-forward svc/todo-frontend 3000:80
kubectl port-forward svc/todo-backend 8000:8000
```

## AIOps Tools

### kubectl-ai Usage

```bash
# Scale deployments
kubectl-ai "scale todo-frontend deployment to 3 replicas"

# View logs
kubectl-ai "show logs for todo-backend pods"

# Diagnose issues
kubectl-ai "why is todo-backend pod not ready?"

# Check resources
kubectl-ai "show resource usage for all todo-chatbot pods"

# Get deployment info
kubectl-ai "describe todo-frontend deployment"
```

### kagent Usage

```bash
# Cluster health
kagent "analyze cluster health"

# Resource optimization
kagent "optimize resource allocation for todo-chatbot"

# Troubleshooting
kagent "diagnose networking issues for todo-frontend"
```

### Gordon (Docker AI) Usage

```bash
# Check capabilities
docker ai "What can you do?"

# Build assistance
docker ai "optimize Dockerfile for todo-chatbot-frontend"

# Troubleshooting
docker ai "why is my container failing to start?"
```

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | Neon PostgreSQL connection string | Yes |
| OPENAI_API_KEY | OpenAI API key for chat | Yes |
| BETTER_AUTH_SECRET | JWT signing secret | Yes |
| PYTHONUNBUFFERED | Python output buffering | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_API_URL | Backend API URL | Yes |
| NODE_ENV | Node environment | No |

## Troubleshooting

### Pod stuck in Pending

```bash
# Check events
kubectl describe pod <pod-name>

# Common cause: Insufficient resources
minikube stop
minikube start --cpus=4 --memory=4096
```

### ImagePullBackOff

```bash
# Ensure using Minikube's Docker
eval $(minikube docker-env)

# Rebuild the image
./scripts/build-images.sh --minikube

# Verify imagePullPolicy: Never in values.yaml
```

### Backend can't connect to database

```bash
# Verify secret exists
kubectl get secret todo-backend-secrets -o yaml

# Check environment variables
kubectl exec -it deployment/todo-backend -- env | grep DATABASE

# Test connectivity
kubectl exec -it deployment/todo-backend -- python -c "import os; print(os.getenv('DATABASE_URL'))"
```

### Ingress not working

```bash
# Verify ingress addon
minikube addons list | grep ingress

# Check ingress status
kubectl get ingress

# Use port-forward as alternative
kubectl port-forward svc/todo-frontend 3000:80
```

### Health checks failing

```bash
# Check backend health
kubectl port-forward svc/todo-backend 8000:8000
curl http://localhost:8000/health
curl http://localhost:8000/ready

# View pod logs
kubectl logs -f deployment/todo-backend
```

## Cleanup

```bash
# Remove deployment but keep Minikube
./scripts/cleanup.sh

# Remove everything including Minikube
./scripts/cleanup.sh --all
```

## Links

- [Phase III: AI Chatbot](../phase-3-ai-chatbot/)
- [Hackathon Requirements](../hackathon2.md)
- [Specification](../specs/001-kubernetes-deployment/spec.md)
