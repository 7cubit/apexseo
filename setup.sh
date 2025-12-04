#!/bin/bash

# ApexSEO - Portable Setup Script
# This script sets up and starts the entire platform on any machine with Docker.

set -e

echo "🚀 ApexSEO Portable Setup"
echo "========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker Desktop.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"

# Setup Environment Variables
echo -e "\n${YELLOW}Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        echo -e "${YELLOW}⚠ Please update .env with your actual secrets (OpenAI, DataForSEO, etc.)${NC}"
    else
        echo -e "${RED}✗ .env.example not found. Cannot create .env${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

# Build and Start
echo -e "\n${YELLOW}Building and starting services...${NC}"
echo "This may take a while on the first run as it builds Docker images."

docker-compose up -d --build

echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check Services
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Frontend is up at http://localhost:3000${NC}"
else
    echo -e "${RED}⚠ Frontend might still be starting. Check logs with 'docker-compose logs -f app'${NC}"
fi

if curl -s http://localhost:4000/health > /dev/null; then # Assuming /health exists, otherwise just check port
    echo -e "${GREEN}✓ API is up at http://localhost:4000${NC}"
else
     # Fallback check
     if nc -z localhost 4000; then
        echo -e "${GREEN}✓ API port is open${NC}"
     else
        echo -e "${RED}⚠ API might still be starting. Check logs with 'docker-compose logs -f api'${NC}"
     fi
fi

echo -e "\n${GREEN}✓ Setup complete!${NC}"
echo -e "\n${YELLOW}Useful commands:${NC}"
echo "  - Stop all services: docker-compose down"
echo "  - View logs:         docker-compose logs -f"
echo "  - Rebuild:           docker-compose up -d --build"
