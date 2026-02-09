#!/bin/bash

# Cleanup Todo Chatbot deployment from Minikube
# Usage: ./cleanup.sh [--all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Cleaning up Todo Chatbot Deployment ===${NC}"

# Uninstall Helm releases
echo -e "${YELLOW}Removing Helm releases...${NC}"
helm uninstall todo-frontend 2>/dev/null || echo "todo-frontend not found"
helm uninstall todo-backend 2>/dev/null || echo "todo-backend not found"

# Delete secrets
echo -e "${YELLOW}Removing secrets...${NC}"
kubectl delete secret todo-backend-secrets 2>/dev/null || echo "Secrets not found"

# Delete any remaining resources
echo -e "${YELLOW}Cleaning up remaining resources...${NC}"
kubectl delete deployment,service,ingress,configmap -l app=todo-chatbot 2>/dev/null || echo "No resources found"

# If --all flag, also delete images and stop Minikube
if [ "$1" == "--all" ]; then
    echo -e "${YELLOW}Removing Docker images...${NC}"
    eval $(minikube docker-env)
    docker rmi todo-chatbot-frontend:latest 2>/dev/null || echo "Frontend image not found"
    docker rmi todo-chatbot-backend:latest 2>/dev/null || echo "Backend image not found"

    echo -e "${YELLOW}Stopping Minikube...${NC}"
    minikube stop
fi

echo -e "${GREEN}=== Cleanup Complete ===${NC}"

# Show remaining resources
echo -e "\n${GREEN}=== Remaining Resources ===${NC}"
kubectl get all -l app=todo-chatbot 2>/dev/null || echo "No resources remaining"
