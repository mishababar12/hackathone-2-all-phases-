#!/bin/bash

# Deploy Todo Chatbot to Minikube
# Usage: ./deploy-minikube.sh [--build]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploying Todo Chatbot to Minikube ===${NC}"

# Check if Minikube is running
if ! minikube status | grep -q "Running"; then
    echo -e "${YELLOW}Starting Minikube...${NC}"
    minikube start --cpus=4 --memory=4096
fi

# Enable ingress addon if not enabled
if ! minikube addons list | grep -q "ingress.*enabled"; then
    echo -e "${YELLOW}Enabling ingress addon...${NC}"
    minikube addons enable ingress
fi

# Point shell to Minikube's Docker daemon
echo -e "${YELLOW}Configuring Docker for Minikube...${NC}"
eval $(minikube docker-env)

# Build images if --build flag is passed
if [ "$1" == "--build" ]; then
    echo -e "${GREEN}Building Docker images...${NC}"
    "$SCRIPT_DIR/build-images.sh" --minikube
fi

# Check if secrets file exists
SECRETS_FILE="$PROJECT_DIR/secrets.yaml"
if [ ! -f "$SECRETS_FILE" ]; then
    echo -e "${YELLOW}Creating secrets template...${NC}"
    cat > "$SECRETS_FILE" << EOF
# Kubernetes Secrets for Todo Chatbot
# Fill in your actual values and run: kubectl apply -f secrets.yaml

apiVersion: v1
kind: Secret
metadata:
  name: todo-backend-secrets
type: Opaque
stringData:
  DATABASE_URL: "your-neon-database-url"
  COHERE_API_KEY: "your-cohere-api-key"
  BETTER_AUTH_SECRET: "your-jwt-secret"
EOF
    echo -e "${RED}Please edit $SECRETS_FILE with your actual credentials${NC}"
    echo -e "${RED}Then run: kubectl apply -f $SECRETS_FILE${NC}"
    exit 1
fi

# Apply secrets
echo -e "${GREEN}Applying secrets...${NC}"
kubectl apply -f "$SECRETS_FILE"

# Deploy backend
echo -e "${GREEN}Deploying backend...${NC}"
helm upgrade --install todo-backend "$PROJECT_DIR/helm/todo-backend" \
    --set secrets.create=false \
    --wait --timeout=5m

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
kubectl wait --for=condition=ready pod -l component=backend --timeout=120s

# Deploy frontend
echo -e "${GREEN}Deploying frontend...${NC}"
helm upgrade --install todo-frontend "$PROJECT_DIR/helm/todo-frontend" \
    --wait --timeout=5m

# Wait for frontend to be ready
echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
kubectl wait --for=condition=ready pod -l component=frontend --timeout=120s

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
echo -e "Minikube IP: ${MINIKUBE_IP}"
echo -e "\nAdd to /etc/hosts:"
echo -e "  ${MINIKUBE_IP} todo.local"
echo -e "\nAccess the application:"
echo -e "  http://todo.local"
echo -e "\nOr use port-forward:"
echo -e "  kubectl port-forward svc/todo-frontend 3000:80"
echo -e "  kubectl port-forward svc/todo-backend 8000:8000"

# Show pod status
echo -e "\n${GREEN}=== Pod Status ===${NC}"
kubectl get pods -l app=todo-chatbot
