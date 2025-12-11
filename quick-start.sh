#!/bin/bash

# ApexSEO - Quick Start Script
# This script sets up and starts the entire platform

set -e

echo "🚀 ApexSEO Quick Start"
echo "======================"

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

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites met${NC}"

# Start Docker services
echo -e "\n${YELLOW}Starting Docker services...${NC}"
docker-compose up -d

# Wait for services
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check ClickHouse
if curl -s http://localhost:8123/ping > /dev/null; then
    echo -e "${GREEN}✓ ClickHouse ready${NC}"
else
    echo -e "${RED}✗ ClickHouse not responding${NC}"
fi

# Check Neo4j
if curl -s http://localhost:7474 > /dev/null; then
    echo -e "${GREEN}✓ Neo4j ready${NC}"
else
    echo -e "${RED}✗ Neo4j not responding${NC}"
fi

# Check Temporal
if curl -s http://localhost:8080 > /dev/null; then
    echo -e "${GREEN}✓ Temporal ready${NC}"
else
    echo -e "${RED}✗ Temporal not responding${NC}"
fi

# Check Admin Dashboard
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✓ Admin Dashboard ready${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Build shared package
echo -e "\n${YELLOW}Building shared package...${NC}"
cd packages/shared
npm run build
cd ../..

echo -e "\n${GREEN}✓ Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Set up environment variables (see docs/testing-deployment.md)"
echo "2. Start API:     cd packages/api && npm run dev"
echo "3. Start Worker:  cd packages/workers && npm run dev"
echo "4. Start Frontend: cd packages/app && npm run dev"
echo "5. Start Admin:    cd packages/admin && npm run dev"
echo "6. Visit Customer Dashboard: http://localhost:3000"
echo "7. Visit Admin Dashboard:    http://localhost:3001"

echo -e "\n${GREEN}Happy coding! 🎉${NC}"
