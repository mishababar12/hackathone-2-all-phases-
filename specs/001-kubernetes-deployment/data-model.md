# Data Model: Kubernetes Resources for Todo Chatbot

**Feature**: 001-kubernetes-deployment
**Date**: 2026-02-08

## Overview

This document defines the Kubernetes resource specifications for deploying the Todo Chatbot application. Unlike traditional data models with database entities, this document describes Infrastructure-as-Code resources.

---

## Resource Inventory

| Resource Type | Name | Namespace | Purpose |
|--------------|------|-----------|---------|
| Deployment | todo-frontend | default | Next.js chat UI |
| Deployment | todo-backend | default | FastAPI + MCP server |
| Service | todo-frontend | default | Internal ClusterIP for frontend |
| Service | todo-backend | default | Internal ClusterIP for backend |
| Ingress | todo-ingress | default | External HTTP access |
| Secret | todo-secrets | default | Sensitive configuration |
| ConfigMap | todo-config | default | Non-sensitive configuration |

---

## Frontend Deployment

### Specification

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  labels:
    app: todo-chatbot
    component: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-chatbot
      component: frontend
  template:
    metadata:
      labels:
        app: todo-chatbot
        component: frontend
    spec:
      containers:
        - name: frontend
          image: todo-chatbot-frontend:latest
          imagePullPolicy: Never  # For Minikube local images
          ports:
            - containerPort: 3000
          env:
            - name: NEXT_PUBLIC_API_URL
              valueFrom:
                configMapKeyRef:
                  name: todo-config
                  key: BACKEND_URL
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| replicas | integer | Yes | Number of pod instances (default: 1) |
| image | string | Yes | Docker image reference |
| containerPort | integer | Yes | Port exposed by container (3000) |
| resources.requests.cpu | string | Yes | Minimum CPU allocation |
| resources.requests.memory | string | Yes | Minimum memory allocation |
| resources.limits.cpu | string | Yes | Maximum CPU allocation |
| resources.limits.memory | string | Yes | Maximum memory allocation |

---

## Backend Deployment

### Specification

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  labels:
    app: todo-chatbot
    component: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-chatbot
      component: backend
  template:
    metadata:
      labels:
        app: todo-chatbot
        component: backend
    spec:
      containers:
        - name: backend
          image: todo-chatbot-backend:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 8000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: todo-secrets
                  key: DATABASE_URL
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: todo-secrets
                  key: OPENAI_API_KEY
            - name: BETTER_AUTH_SECRET
              valueFrom:
                secretKeyRef:
                  name: todo-secrets
                  key: BETTER_AUTH_SECRET
          resources:
            requests:
              cpu: "200m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 5
```

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| replicas | integer | Yes | Number of pod instances (default: 1) |
| image | string | Yes | Docker image reference |
| containerPort | integer | Yes | Port exposed by container (8000) |
| DATABASE_URL | secret | Yes | Neon PostgreSQL connection string |
| OPENAI_API_KEY | secret | Yes | OpenAI API key for chat |
| BETTER_AUTH_SECRET | secret | Yes | JWT signing secret |

---

## Services

### Frontend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend
spec:
  type: ClusterIP
  selector:
    app: todo-chatbot
    component: frontend
  ports:
    - port: 80
      targetPort: 3000
```

### Backend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-backend
spec:
  type: ClusterIP
  selector:
    app: todo-chatbot
    component: backend
  ports:
    - port: 8000
      targetPort: 8000
```

---

## Ingress

### Specification

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: todo.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: todo-frontend
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: todo-backend
                port:
                  number: 8000
```

### Routing Rules

| Path | Service | Port | Description |
|------|---------|------|-------------|
| / | todo-frontend | 80 | Chat UI |
| /api | todo-backend | 8000 | REST API and chat endpoint |

---

## Secret

### Specification

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
type: Opaque
data:
  DATABASE_URL: <base64-encoded>
  OPENAI_API_KEY: <base64-encoded>
  BETTER_AUTH_SECRET: <base64-encoded>
```

### Required Keys

| Key | Source | Description |
|-----|--------|-------------|
| DATABASE_URL | Neon Dashboard | PostgreSQL connection string |
| OPENAI_API_KEY | OpenAI Platform | API key for GPT access |
| BETTER_AUTH_SECRET | Generated | JWT signing secret |

---

## ConfigMap

### Specification

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
data:
  BACKEND_URL: "http://todo-backend:8000"
  NODE_ENV: "production"
```

### Keys

| Key | Value | Description |
|-----|-------|-------------|
| BACKEND_URL | http://todo-backend:8000 | Internal backend service URL |
| NODE_ENV | production | Node environment |

---

## Resource Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      Ingress (todo-ingress)                  │
│                        host: todo.local                      │
└───────────────┬─────────────────────────┬───────────────────┘
                │ /                       │ /api
                ▼                         ▼
┌───────────────────────┐    ┌───────────────────────┐
│  Service              │    │  Service              │
│  (todo-frontend:80)   │    │  (todo-backend:8000)  │
└───────────┬───────────┘    └───────────┬───────────┘
            │                            │
            ▼                            ▼
┌───────────────────────┐    ┌───────────────────────┐
│  Deployment           │    │  Deployment           │
│  (todo-frontend)      │    │  (todo-backend)       │
│  - ConfigMap          │    │  - Secret             │
│  - Port 3000          │    │  - Port 8000          │
└───────────────────────┘    └───────────────────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │  External             │
                             │  Neon PostgreSQL      │
                             └───────────────────────┘
```

---

## State Transitions

### Pod Lifecycle

| State | Description | Triggers |
|-------|-------------|----------|
| Pending | Pod scheduled but not running | Initial creation |
| Running | Pod running and healthy | Successful start |
| Ready | Pod passing readiness probe | /ready returns 200 |
| Failed | Pod crashed or unhealthy | /health fails |
| Terminated | Pod stopped | Manual delete or crash |

### Deployment Rollout

| Status | Description |
|--------|-------------|
| Progressing | New pods being created |
| Available | Minimum replicas ready |
| Complete | All replicas updated |
| Failed | Rollout timed out |
