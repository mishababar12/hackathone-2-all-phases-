#!/bin/bash

# Build Docker images for Todo Chatbot
# Usage: ./build-images.sh [--minikube]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Building Todo Chatbot Docker Images ===${NC}"

# Check if we should use Minikube's Docker daemon
if [ "$1" == "--minikube" ]; then
    echo -e "${YELLOW}Using Minikube's Docker daemon...${NC}"
    eval $(minikube docker-env)
fi

# Build Backend Image
echo -e "\n${GREEN}Building backend image...${NC}"
docker build \
    -t todo-chatbot-backend:latest \
    -f "$PROJECT_DIR/backend/Dockerfile" \
    "$PROJECT_DIR/backend"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
else
    echo -e "${RED}✗ Backend image build failed${NC}"
    exit 1
fi

# Build Frontend Image
echo -e "\n${GREEN}Building frontend image...${NC}"
docker build \
    -t todo-chatbot-frontend:latest \
    -f "$PROJECT_DIR/frontend/Dockerfile" \
    "$PROJECT_DIR/frontend"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend image built successfully${NC}"
else
    echo -e "${RED}✗ Frontend image build failed${NC}"
    exit 1
fi

# List built images
echo -e "\n${GREEN}=== Built Images ===${NC}"
docker images | grep todo-chatbot

echo -e "\n${GREEN}=== Build Complete ===${NC}"
echo -e "To run locally:"
echo -e "  docker run -p 8000:8000 --env-file .env todo-chatbot-backend:latest"
echo -e "  docker run -p 3000:3000 todo-chatbot-frontend:latest"
echo -e "\nTo deploy to Minikube:"
echo -e "  ./deploy-minikube.sh"
