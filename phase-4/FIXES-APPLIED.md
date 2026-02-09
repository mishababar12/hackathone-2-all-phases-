# Phase 4 Fixes Applied

**Date**: 2025-02-09
**Issue**: Chatbot returning 500 errors
**Root Cause**: API key configuration mismatch between code and Kubernetes secrets

---

## 🔴 Critical Bug Fixed

### Problem
The chat endpoint was failing with 500 errors because of an environment variable mismatch:

- **Code Expected**: `COHERE_API_KEY` (chat.py:60)
- **Secrets Provided**: `OPENAI_API_KEY` (secrets.yaml, Helm values)

This caused the API key lookup to return `None`, triggering the error:
```python
if not api_key:
    raise HTTPException(status_code=500, detail="Cohere API key not configured")
```

### Solution
Updated all configuration files to use `COHERE_API_KEY` consistently:

| File | Changed | Line(s) |
|------|---------|---------|
| `secrets.yaml.example` | `OPENAI_API_KEY` → `COHERE_API_KEY` | 12 |
| `helm/todo-backend/values.yaml` | `openaiApiKey` → `cohereApiKey` | 47 |
| `helm/todo-backend/templates/secret.yaml` | `OPENAI_API_KEY` → `COHERE_API_KEY` | 15 |
| `helm/todo-backend/templates/deployment.yaml` | `OPENAI_API_KEY` → `COHERE_API_KEY` | 37-41 |
| `scripts/deploy-minikube.sh` | `OPENAI_API_KEY` → `COHERE_API_KEY` | 56 |
| `README.md` | Documentation updated | 41, 141, 229 |

---

## ✅ Docker Build Configuration Verified

### Frontend (Next.js)
- ✅ `output: "standalone"` configured in next.config.ts
- ✅ Multi-stage Dockerfile correctly handles standalone build
- ✅ Health check configured with wget
- ✅ Non-root user (nextjs) for security

### Backend (FastAPI)
- ✅ Python 3.11-slim base image
- ✅ Dependencies include cohere, sqlmodel, fastapi
- ✅ Health check endpoint `/health` configured
- ✅ Port 8000 exposed for Kubernetes

---

## 📋 New Phase 4 Specification Created

Created `specs/spec-phase4.md` with complete requirements for:
- Kubernetes deployment with Minikube
- Helm charts for orchestration
- Ingress configuration for routing
- AIOps tools integration (kubectl-ai, kagent, Gordon)
- Environment variable documentation
- Success criteria and acceptance tests

---

## 🚀 How to Deploy (Updated Steps)

### 1. Prepare Secrets
```bash
cd phase-4
cp secrets.yaml.example secrets.yaml
# Edit secrets.yaml with your actual values:
#   DATABASE_URL=your-neon-postgresql-url
#   COHERE_API_KEY=your-cohere-api-key
#   BETTER_AUTH_SECRET=random-32-char-string
```

### 2. Start Minikube
```bash
minikube start --cpus=4 --memory=4096 --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
```

### 3. Build Images
```bash
eval $(minikube docker-env)
./scripts/build-images.sh --minikube
```

### 4. Deploy
```bash
kubectl apply -f secrets.yaml
./scripts/deploy-minikube.sh
```

### 5. Access Application
```bash
# Add to /etc/hosts (Windows: C:\Windows\System32\drivers\etc\hosts)
echo "$(minikube ip) todo.local" | sudo tee -a /etc/hosts

# Open browser
open http://todo.local

# Or use port-forward
kubectl port-forward svc/todo-frontend 3000:80
kubectl port-forward svc/todo-backend 8000:8000
```

---

## 🧪 Testing the Chatbot Fix

### Test 1: Verify Environment Variables
```bash
# Check if COHERE_API_KEY is set in the pod
kubectl exec -it deployment/todo-backend -- env | grep COHERE
```

**Expected Output**: `COHERE_API_KEY=<your-key>`

### Test 2: Direct API Test
```bash
# Port-forward to backend
kubectl port-forward svc/todo-backend 8000:8000

# In another terminal, test the health endpoint
curl http://localhost:8000/health

# Expected: {"status":"healthy","service":"todo-backend"}
```

### Test 3: Chat Endpoint Test (With Auth)
```bash
# First, get a JWT token by logging in
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' \
  | jq -r '.access_token')

# Then test the chat endpoint
curl -X POST http://localhost:8000/api/chat/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### Test 4: Frontend Integration
1. Open http://todo.local in browser
2. Login with your credentials
3. Navigate to the chatbot feature
4. Send a message like "Create a task called Test Kubernetes"
5. Verify the task is created successfully

---

## 📊 Phase 4 Requirements Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| Docker Images | ✅ Complete | Both images build correctly |
| Helm Charts | ✅ Complete | Frontend & backend charts ready |
| API Key Config | ✅ **FIXED** | Now uses COHERE_API_KEY |
| Ingress Setup | ✅ Complete | nginx ingress configured |
| Health Probes | ✅ Complete | liveness and readiness configured |
| Documentation | ✅ Updated | README.md reflects correct API |
| AIOps Tools | ✅ Documented | kubectl-ai, kagent, Gordon documented |
| Phase 4 Spec | ✅ Created | specs/spec-phase4.md with full requirements |

---

## 🔍 Troubleshooting

### Chat still returns 500?
1. Verify COHERE_API_KEY is set:
   ```bash
   kubectl get secret todo-backend-secrets -o yaml | grep COHERE
   ```
2. Check pod logs:
   ```bash
   kubectl logs -f deployment/todo-backend
   ```
3. Verify Cohere API key is valid at https://dashboard.cohere.com/

### Pods not starting?
```bash
kubectl describe pod <pod-name>
kubectl get events --sort-by='.lastTimestamp'
```

### Images not found?
```bash
# Ensure you're using Minikube's Docker
eval $(minikube docker-env)
docker images | grep todo-chatbot
```

---

## 📝 Files Modified

1. `phase-4/secrets.yaml.example` - Updated to use COHERE_API_KEY
2. `phase-4/helm/todo-backend/values.yaml` - Updated secret config
3. `phase-4/helm/todo-backend/templates/secret.yaml` - Updated secret template
4. `phase-4/helm/todo-backend/templates/deployment.yaml` - Updated env var
5. `phase-4/scripts/deploy-minikube.sh` - Updated secrets template
6. `phase-4/README.md` - Updated documentation
7. `phase-4/specs/spec-phase4.md` - **NEW** Complete Phase 4 specification

---

## ✨ Next Steps

1. **Get Cohere API Key**: https://dashboard.cohere.com/
2. **Update secrets.yaml** with your actual credentials
3. **Run deployment**: `./scripts/deploy-minikube.sh`
4. **Test chatbot**: Use the testing guide above
5. **Verify AIOps tools**: Try kubectl-ai commands

---

## 🎯 Success Criteria

Phase 4 is complete when:
- ✅ All pods are running (`kubectl get pods` shows READY)
- ✅ Frontend loads at http://todo.local
- ✅ Health endpoints return 200 OK
- ✅ Chatbot responds without 500 errors
- ✅ Tasks can be created via chat
- ✅ AIOps tools can manage the deployment
