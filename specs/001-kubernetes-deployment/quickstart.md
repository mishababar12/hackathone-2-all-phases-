# Quick Start: Kubernetes Deployment for Todo Chatbot

**Feature**: 001-kubernetes-deployment
**Date**: 2026-02-08

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Check Command | Install Guide |
|------|---------|---------------|---------------|
| Docker Desktop | 4.53+ | `docker --version` | [docker.com/get-docker](https://docker.com/get-docker) |
| Minikube | 1.32+ | `minikube version` | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/) |
| kubectl | 1.28+ | `kubectl version --client` | Included with Docker Desktop |
| Helm | 3.x | `helm version` | [helm.sh/docs/intro/install](https://helm.sh/docs/intro/install/) |
| kubectl-ai | Latest | `kubectl-ai --help` | [github.com/sozercan/kubectl-ai](https://github.com/sozercan/kubectl-ai) |

## Step 1: Start Minikube

```bash
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=4096 --driver=docker

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify cluster is running
kubectl cluster-info
```

## Step 2: Configure Docker Environment

```bash
# Point your shell to Minikube's Docker daemon
# This allows building images directly in Minikube
eval $(minikube docker-env)

# Verify (should show minikube context)
docker info | grep "Name:"
```

## Step 3: Build Docker Images

```bash
# Navigate to phase-4 directory
cd phase-4

# Build frontend image
docker build -t todo-chatbot-frontend:latest ./frontend

# Build backend image
docker build -t todo-chatbot-backend:latest ./backend

# Verify images are built
docker images | grep todo-chatbot
```

## Step 4: Create Kubernetes Secrets

Create a file `secrets.yaml` with your actual values:

```bash
# Create secrets from environment variables
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL='your-neon-database-url' \
  --from-literal=OPENAI_API_KEY='your-openai-api-key' \
  --from-literal=BETTER_AUTH_SECRET='your-jwt-secret'

# Verify secret created
kubectl get secrets
```

## Step 5: Deploy with Helm

```bash
# Deploy backend first (frontend depends on it)
helm install todo-backend ./helm/todo-backend

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l component=backend --timeout=120s

# Deploy frontend
helm install todo-frontend ./helm/todo-frontend

# Verify deployments
kubectl get pods
kubectl get services
```

## Step 6: Configure Ingress Access

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
# Example: 192.168.49.2 todo.local
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts
```

## Step 7: Verify Deployment

```bash
# Check all pods are running
kubectl get pods

# Expected output:
# NAME                             READY   STATUS    RESTARTS   AGE
# todo-frontend-xxxx               1/1     Running   0          1m
# todo-backend-xxxx                1/1     Running   0          2m

# Check services
kubectl get services

# Test backend health endpoint
kubectl port-forward svc/todo-backend 8000:8000 &
curl http://localhost:8000/health

# Test frontend
kubectl port-forward svc/todo-frontend 3000:80 &
curl http://localhost:3000
```

## Step 8: Access the Application

Open your browser and navigate to:

```
http://todo.local
```

Or use port-forward for direct access:

```bash
# Frontend
kubectl port-forward svc/todo-frontend 3000:80

# Then open: http://localhost:3000
```

---

## Using kubectl-ai (AIOps)

Once deployed, you can use kubectl-ai for intelligent operations:

```bash
# Scale frontend
kubectl-ai "scale todo-frontend deployment to 3 replicas"

# View logs
kubectl-ai "show logs for todo-backend pods"

# Check resource usage
kubectl-ai "show resource usage for all pods"

# Diagnose issues
kubectl-ai "why is todo-backend pod not ready?"
```

---

## Common Commands

### Viewing Status

```bash
# All resources
kubectl get all

# Pod details
kubectl describe pod <pod-name>

# Logs
kubectl logs -f deployment/todo-backend
kubectl logs -f deployment/todo-frontend
```

### Scaling

```bash
# Scale manually
kubectl scale deployment todo-frontend --replicas=3

# Or with kubectl-ai
kubectl-ai "scale frontend to 3 replicas"
```

### Updating

```bash
# Rebuild image after code changes
docker build -t todo-chatbot-frontend:latest ./frontend

# Restart deployment to pick up new image
kubectl rollout restart deployment todo-frontend
```

### Cleanup

```bash
# Remove Helm releases
helm uninstall todo-frontend
helm uninstall todo-backend

# Delete secrets
kubectl delete secret todo-secrets

# Stop Minikube
minikube stop

# Delete cluster (optional)
minikube delete
```

---

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
# Ensure you're using Minikube's Docker
eval $(minikube docker-env)

# Rebuild the image
docker build -t todo-chatbot-frontend:latest ./frontend

# Verify imagePullPolicy: Never in deployment
```

### Backend can't connect to database

```bash
# Verify secret exists
kubectl get secret todo-secrets -o yaml

# Check environment variables in pod
kubectl exec -it deployment/todo-backend -- env | grep DATABASE

# Test database connectivity
kubectl exec -it deployment/todo-backend -- python -c "import sqlmodel; print('OK')"
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

---

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Follow the tasks to implement the deployment
3. Test the deployment locally
4. Document any issues encountered
